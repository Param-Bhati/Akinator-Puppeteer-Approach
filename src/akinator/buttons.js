// src/akinator/buttons.js

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// Main answer buttons: Yes / No / IDK / Probably / Probably Not
function buildAnswerRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_yes")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("aki_no")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("aki_idk")
      .setEmoji("❓")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("aki_prob")
      .setEmoji("👍")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("aki_probno")
      .setEmoji("👎")
      .setStyle(ButtonStyle.Primary)
  );
}

// Control buttons: Back / Stop
function buildControlRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_back")
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("aki_stop")
      .setEmoji("🛑")
      .setStyle(ButtonStyle.Danger)
  );
}

// Optional: play again button we’ll use on the final screen
function buildPlayAgainRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_play_again")
      .setLabel("Play again")
      .setStyle(ButtonStyle.Success)
  );
}

// Map button customId -> akinator API answer code
function mapButtonToAnswer(customId) {
  switch (customId) {
    case "aki_yes":
      return 0; // Yes
    case "aki_no":
      return 1; // No
    case "aki_idk":
      return 2; // Don't know
    case "aki_prob":
      return 3; // Probably
    case "aki_probno":
      return 4; // Probably not
    default:
      return null;
  }
}

module.exports = {
  buildAnswerRow,
  buildControlRow,
  buildPlayAgainRow,
  mapButtonToAnswer
};
