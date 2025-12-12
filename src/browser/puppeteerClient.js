// src/browser/puppeteerClient.js

const puppeteer = require("puppeteer");

let browser = null;

async function launchBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  console.log("Puppeteer browser launched");
  return browser;
}

function getBrowser() {
  if (!browser) {
    throw new Error("Puppeteer browser not launched yet");
  }
  return browser;
}

async function closeBrowser() {
  if (!browser) return;
  await browser.close();
  browser = null;
  console.log("Puppeteer browser closed");
}

module.exports = {
  launchBrowser,
  getBrowser,
  closeBrowser
};
