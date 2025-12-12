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

// Map button customIds → answer index
// Adjust if your button ids differ
const BUTTON_TO_INDEX = {
  aki_yes: 0,
  aki_no: 1,
  aki_idk: 2,
  aki_probably: 3,
  aki_probably_not: 4
};

async function startGame(userId, options = {}) {
  cleanupInactive();

  const existing = getSession(userId);
  if (existing && !existing.finished) {
    throw new Error("You already have an active Akinator game.");
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const firstState = await initGamePage(page, options);

    if (!firstState || firstState.type !== "question") {
      // Clean up the page if we failed to start
      await page.close().catch(() => {});
      return { type: "unknown" };
    }

    createSession(userId, {
      page,
      options,
      finished: false,
      lastUpdated: Date.now(),
      // you can later store history/progress here
    });

    return firstState;
  } catch (err) {
    console.error("Puppeteer startGame error:", err);
    try {
      await page.close();
    } catch {}
    return { type: "unknown" };
  }
}

async function handleAnswer(userId, buttonId) {
  const session = getSession(userId);
  if (!session || session.finished) {
    throw new Error("No active game for this user.");
  }

  const page = session.page;
  session.lastUpdated = Date.now();

  // Back button (if you ever map one to this manager)
  if (buttonId === "aki_back") {
    const ok = await clickBack(page);
    if (!ok) {
      return { type: "unknown" };
    }
    const state = await readState(page);
    updateSession(userId, {}); // keep session alive
    return state;
  }

  const answerIndex = BUTTON_TO_INDEX[buttonId];
  if (answerIndex === undefined) {
    return { type: "unknown" };
  }

  const clicked = await clickAnswer(page, answerIndex);
  if (!clicked) {
    return { type: "unknown" };
  }

  const state = await readState(page);

  // If Akinator shows a final guess and you later handle “play again”,
  // you can mark finished here when appropriate.
  if (state.type === "guess") {
    updateSession(userId, { state: "guess" });
  } else {
    updateSession(userId, {});
  }

  return state;
}

async function stopGame(userId) {
  const session = getSession(userId);
  if (!session) return;

  try {
    if (session.page && !session.page.isClosed()) {
      await session.page.close();
    }
  } catch {
    // ignore close errors
  }

  deleteSession(userId);
}

module.exports = {
  startGame,
  handleAnswer,
  stopGame
};
