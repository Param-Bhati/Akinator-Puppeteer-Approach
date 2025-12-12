const { launchBrowser, closeBrowser } = require("./browser/puppeteerClient");
require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, Collection } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds // slash commands + interactions
  ]
});
const fs = require("node:fs");
const path = require("node:path");
// load commands from files


// simple in-memory stats
client.stats = {
  gamesPlayed: 0,
  gamesWon: 0
};

// collection for commands (we'll fill this later)
client.commands = new Collection();

// rotating statuses
const statuses = [
  "Playing /Akinator",
  "Playing In your mind",
  "Playing Minecraft"
];
// load command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
    // launch Puppeteer once
  launchBrowser().catch(err => {
    console.error("Failed to launch Puppeteer:", err);
  });

  let i = 0;
const setStatus = () => {
  const name = statuses[i % statuses.length];
  try {
    client.user.setActivity({ name, type: ActivityType.Playing });
  } catch {
    // ignore status errors
  }
  i++;
};

  setStatus();
  setInterval(setStatus, 30_000); // 30 seconds
});

// interaction handler (slash commands + buttons)
// we'll implement the real logic in src/handlers/interaction.js later
const handleInteraction = require("./handlers/interaction");
client.on("interactionCreate", (interaction) => handleInteraction(client, interaction));

client.login(process.env.BOT_TOKEN);
