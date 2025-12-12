// src/browser/akinator/pageLogic.js

// Simple sleep helper for older Puppeteer versions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Play button (text-based, via XPath)
const PLAY_BUTTON_XPATH =
  "//a[contains(., 'Play') or contains(., 'PLAY')]";

// Character mode option (first item in the DB list)
const CHARACTER_SELECTOR =
  "#base-section > div.body-section > div > div > div.col-md-5 > div.database-selection.selector.dialog-box > ul > li:nth-child(1)";

// Question + answers
const QUESTION_SELECTOR = "#question-label";
const YES_SELECTOR = "#a_yes";
const NO_SELECTOR = "#a_no";
const IDK_SELECTOR = "#a_dont_know";
const PROBABLY_SELECTOR = "#a_probably";
// Note: site’s id is actually misspelled: a_probaly_not
const PROBABLY_NOT_SELECTOR = "#a_probaly_not";
const BACK_SELECTOR = "#a_cancel_answer";

// Guess card
const GUESS_NAME_SELECTOR = "#name_proposition";
const GUESS_DESC_SELECTOR = "#description_proposition";
const GUESS_IMAGE_SELECTOR = "#img_character > img";
const GUESS_CORRECT_YES_SELECTOR = "#a_propose_yes";
const GUESS_CORRECT_NO_SELECTOR = "#a_propose_no";
const PLAY_AGAIN_SELECTOR = "#a_replay > span";

/**
 * Helper: wait and click by CSS selector or XPath
 */
async function safeClick(page, selector, timeout = 5000, isXPath = false) {
  try {
    if (isXPath) {
      await page.waitForXPath(selector, { timeout });
      const handles = await page.$x(selector);
      if (!handles || !handles[0]) return false;
      await handles[0].click();
    } else {
      await page.waitForSelector(selector, { timeout });
      await page.click(selector);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize the game page, select character mode, return first question state
 */
async function initGamePage(
  page,
  { language = "en", mode = "character" } = {}
) {
  // Always use English / Characters for now
  await page.goto("https://en.akinator.com", {
    waitUntil: "domcontentloaded"
  });

  // Click Play (XPath)
  await safeClick(page, PLAY_BUTTON_XPATH, 8000, true);

  // Click Character mode
  await safeClick(page, CHARACTER_SELECTOR, 10000, false);

  // Let the first question load, then capture a debug screenshot
  await sleep(3000);
  await page.screenshot({ path: "debug-akinator.png", fullPage: true });

  await page.waitForSelector(QUESTION_SELECTOR, { timeout: 15000 });

  return await readQuestionState(page);
}

/**
 * Read current state: either a guess card or a question
 */
async function readState(page) {
  // Try guess first
  const guessNameEl = await page.$(GUESS_NAME_SELECTOR);
  if (guessNameEl) {
    const guessName = await guessNameEl.evaluate(node =>
      node.textContent.trim()
    );

    if (guessName) {
      const descEl = await page.$(GUESS_DESC_SELECTOR);
      const imgEl = await page.$(GUESS_IMAGE_SELECTOR);

      const description = descEl
        ? await descEl.evaluate(node => node.textContent.trim())
        : "";
      const image = imgEl
        ? await imgEl.evaluate(node => node.getAttribute("src"))
        : null;

      return {
        type: "guess",
        guess: {
          name: guessName,
          description: description || "",
          image: image || null
        }
      };
    }
  }

  // Otherwise treat as a question
  return await readQuestionState(page);
}

/**
 * Read just the question state
 */
async function readQuestionState(page) {
  const exists = await page.$(QUESTION_SELECTOR);
  console.log("QUESTION_SELECTOR exists:", !!exists);

  if (!exists) {
    return { type: "unknown" };
  }

  const questionText = await page
    .$eval(QUESTION_SELECTOR, el => el.textContent.trim())
    .catch(() => null);

  console.log("QUESTION_TEXT:", questionText);

  if (!questionText) {
    return { type: "unknown" };
  }

  const progress = 0; // could be parsed later from the UI

  return {
    type: "question",
    question: questionText,
    progress
  };
}

/**
 * Click one of the five answers:
 * 0 = Yes, 1 = No, 2 = IDK, 3 = Probably, 4 = Probably not
 */
async function clickAnswer(page, answerIndex) {
  let selector = null;

  switch (answerIndex) {
    case 0:
      selector = YES_SELECTOR;
      break;
    case 1:
      selector = NO_SELECTOR;
      break;
    case 2:
      selector = IDK_SELECTOR;
      break;
    case 3:
      selector = PROBABLY_SELECTOR;
      break;
    case 4:
      selector = PROBABLY_NOT_SELECTOR;
      break;
    default:
      return false;
  }

  const clicked = await safeClick(page, selector, 8000, false);
  if (!clicked) return false;

  // wait for next state to appear
  await sleep(1000);
  return true;
}

/**
 * Click the "back" answer
 */
async function clickBack(page) {
  const clicked = await safeClick(page, BACK_SELECTOR, 8000, false);
  if (!clicked) return false;

  await sleep(1000);
  return true;
}

module.exports = {
  initGamePage,
  readState,
  clickAnswer,
  clickBack
};
