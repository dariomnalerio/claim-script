import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { setTimeout } from "node:timers/promises";
import { log, handleCtrlC, parseArgs } from "./utils.js";
puppeteer.use(StealthPlugin());
import { config as loadDotEnv } from "dotenv";
loadDotEnv();

// Function to send the claim command
const sendClaimCommand = async (page) => {
  log("Typing and sending message...");
  await page.keyboard.type("/claim", { delay: 150 });
  await setTimeout(500); // wait 500ms
  await page.keyboard.press("Enter"); // first enter adds a space
  await setTimeout(500); // wait 500ms
  await page.keyboard.press("Enter"); // second enter sends the message
};

/*
 * Main function
 * Opens a browser, navigates to the channel, and sends the claim command every hour.
 * The first time the script is run, the user will need to scan the QR code to login - code might be commented out.
 * For this, headless mode must be set to false on launch configuration (see below) - this will open a browser window.
 * On subsequent runs, the user will be logged in automatically. You can turn headless to "new" and the browser will be hidden.
 * The script will run indefinitely until it is stopped.
 */
(async () => {
  // Add a Ctrl-C (SIGINT) handler
  process.on("SIGINT", handleCtrlC);

  try {
    console.log("-----------------------------------------------------");
    log("Welcome to the claiming bot!");

    // Parse the command line arguments
    // If --login is passed, the user will need to scan the QR code to login
    // If --headless is passed, the browser will be hidden
    const headlessOption = parseArgs();
    let headless;

    if (headlessOption === "headless") headless = "new";
    else if (headlessOption === "login") headless = false;

    const browser = await puppeteer.launch({
      headless: headless, // "new" for headless, "false" for gui
      userDataDir: "./user_data", // directory to store cookies etc
    });

    const page = await browser.newPage(); // open a new tab

    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
    });

    if (headlessOption === "login") {
      await page.goto("https://discord.com/login");
      log("Discord login page opened...");
      log("Waiting 60 seconds for QR scan...");
      await setTimeout(60000);
      log("60 seconds passed, continuing...");
    }

    log("Navigating to channel...");
    await page.goto(process.env.CHANNEL_URL);

    log("Waiting for the page to load...");
    await page.waitForSelector('div[role="textbox"]');

    log("Starting claim loop...");
    while (true) {
      await sendClaimCommand(page);

      // Random time between 1 hour 5 seconds and 1 hour 5 minutes 5 seconds
      const time = 3605000 + Math.floor(Math.random() * 300000) + 1;

      // Log the time when next claim will take place
      log(
        `Next claim will be at ${new Date(
          Date.now() + time
        ).toLocaleTimeString()}`
      );

      // Wait for the next claim
      await setTimeout(time);
    }
  } catch (e) {
    log(e);
  } finally {
    // Remove the Ctrl-C handler and exit
    process.off("SIGINT", handleCtrlC);
    // this is never reached but left here for reference
    await browser.close();
  }
})();
