// src/akinator/embeds.js

const { EmbedBuilder } = require("discord.js");
const { embedColor } = require("../config");

const FOOTER_TEXT = "BotWorks.Inc • 2025 • made with ❤️ by DualFactor12";

function startEmbed(user, mode, language, childMode) {
  return new EmbedBuilder()
    .setTitle("🧠 Starting Akinator...")
    .setDescription(
      [
        `Thinking of your **${mode}**...`,
        "",
        `**Language:** ${language}`,
        `**Child mode:** ${childMode ? "On" : "Off"}`,
        "",
        "Answer the questions using the buttons below!"
      ].join("\n")
    )
    .setColor(embedColor)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

function questionEmbed(user, question, step, progress) {
  return new EmbedBuilder()
    .setTitle(`❓ Question ${step + 1}`)
    .setDescription(
      [
        `**Progress:** ${Math.round(progress)}%`,
        "",
        `**${question}**`
      ].join("\n")
    )
    .setColor(embedColor)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

function thinkingEmbed(user, step, progress) {
  return new EmbedBuilder()
    .setTitle(`🤔 Question ${step + 1}`)
    .setDescription(
      [
        `**Progress:** ${Math.round(progress)}%`,
        "",
        "Thinking about your answer..."
      ].join("\n")
    )
    .setColor(embedColor)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

function guessEmbed(user, guess, isWin) {
  const title = isWin ? "🎉 I guessed it!" : "😔 I couldn’t guess...";
  const descLines = [];

  if (guess) {
    descLines.push(
      `**Name:** ${guess.name}`,
      guess.description ? `**Description:** ${guess.description}` : "",
      guess.ranking ? `**Chance:** ${Math.round(guess.ranking)}%` : ""
    );
  } else {
    descLines.push("No more guesses available.");
  }

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(descLines.filter(Boolean).join("\n"))
    .setColor(isWin ? 0x57f287 : embedColor)
    .setThumbnail(guess && guess.absolute_picture_path ? guess.absolute_picture_path : null)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

function stoppedEmbed(user) {
  return new EmbedBuilder()
    .setTitle("🛑 Game stopped")
    .setDescription(`${user.username}, you ended the Akinator game.`)
    .setColor(embedColor)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

function timeoutEmbed(user) {
  return new EmbedBuilder()
    .setTitle("⌛ Game timed out")
    .setDescription(`${user.username}, there was no answer for a while, so the game ended.`)
    .setColor(embedColor)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: FOOTER_TEXT });
}

module.exports = {
  startEmbed,
  questionEmbed,
  thinkingEmbed,
  guessEmbed,
  stoppedEmbed,
  timeoutEmbed
};
