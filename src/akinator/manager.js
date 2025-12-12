// src/browser/akinator/manager.js

const { getBrowser } = require("../puppeteerClient");
const {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  cleanupInactive
} = require("./sessionStore");
const {
  initGamePage,
  readState,
  clickAnswer,
  clickBack
} = require("./pageLogic");

// Start a new game and return first state
async function startGame(userId, options = {}) {
  cleanupInactive();

  const existing = getSession(userId);
  if (existing && !existing.finished) {
    throw new Error("You already have an active Akinator game.");
  }

  const browser = getBrowser();
  const page = await browser.newPage();

  // Init game in browser and get first state
  const state = await initGamePage(page, options);

  createSession(userId, {
    page,
    options,
    finished: false,
    state
  });

  return state; // { type: 'question', ... } or 'unknown'
}

// Handle an answer button (Yes/No/IDK/Probably/ProbablyNot)
async function handleAnswer(userId, buttonId) {
  const session = getSession(userId);
  if (!session || session.finished) {
    throw new Error("No active game for this user.");
  }

  const { page } = session;

  // Map buttonId -> answer index
  let answerIndex = null;
  switch (buttonId) {
    case "aki_yes":
      answerIndex = 0;
      break;
    case "aki_no":
      answerIndex = 1;
      break;
    case "aki_idk":
      answerIndex = 2;
      break;
    case "aki_prob":
      answerIndex = 3;
      break;
    case "aki_probno":
      answerIndex = 4;
      break;
    case "aki_back":
      await clickBack(page);
      break;
    default:
      // ignore unknown
      return session.state;
  }

  if (answerIndex !== null) {
    const ok = await clickAnswer(page, answerIndex);
    if (!ok) {
      throw new Error("Failed to click answer on Akinator page.");
    }
  }

  const newState = await readState(page);
  updateSession(userId, { state: newState });

  // If guess, mark finished (we still keep page open so user can click yes/no if you want later)
  if (newState.type === "guess") {
    session.finished = true;
  }

  return newState;
}

// Stop game and close page
async function stopGame(userId) {
  const session = getSession(userId);
  if (!session) return;

  try {
    if (session.page && !session.page.isClosed()) {
      await session.page.close();
    }
  } catch {
    // ignore
  }

  deleteSession(userId);
}

module.exports = {
  startGame,
  handleAnswer,
  stopGame
};
