// src/commands/akinator.js

const { SlashCommandBuilder } = require("discord.js");
const {
  supportedLanguages,
  supportedModes,
  defaultLanguage,
  defaultMode,
  defaultChildMode
} = require("../config");

// Puppeteer-based manager
const puppetManager = require("../browser/akinator/manager");

// Reuse existing buttons + embeds
const {
  buildAnswerRow,
  buildControlRow,
  buildPlayAgainRow
} = require("../akinator/buttons");
const {
  questionEmbed,
  guessEmbed,
  stoppedEmbed
} = require("../akinator/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("akinator")
    .setDescription("Play Akinator: I will try to guess your character, animal, or object.")
    .addStringOption(option =>
      option
        .setName("mode")
        .setDescription("What should I guess?")
        .setRequired(false)
        .addChoices(
          { name: "Character (default)", value: "character" },
          { name: "Animal", value: "animal" },
          { name: "Object", value: "object" }
        )
    )
    .addStringOption(option =>
      option
        .setName("language")
        .setDescription("Language for the game (default: en)")
        .setRequired(false)
        .addChoices(
          { name: "English", value: "en" },
          { name: "French", value: "fr" },
          { name: "Spanish", value: "es" },
          { name: "German", value: "de" },
          { name: "Italian", value: "it" },
          { name: "Portuguese", value: "pt" },
          { name: "Russian", value: "ru" }
        )
    )
    .addBooleanOption(option =>
      option
        .setName("child_mode")
        .setDescription("Filter NSFW/mature content (default: off)")
        .setRequired(false)
    ),

  // ✅ Fixed execute with immediate defer + single editReply
  async execute(client, interaction) {
    const mode = interaction.options.getString("mode") || defaultMode;
    const language = interaction.options.getString("language") || defaultLanguage;
    const childMode =
      interaction.options.getBoolean("child_mode") === null
        ? defaultChildMode
        : interaction.options.getBoolean("child_mode");

    if (!supportedModes.includes(mode) || !supportedLanguages.includes(language)) {
      return interaction.reply({
        content: "Invalid options.",
        ephemeral: true
      });
    }

    // Defer immediately to avoid timeout / unknown interaction
    await interaction.deferReply();

    try {
      const state = await puppetManager.startGame(interaction.user.id, {
        mode,
        language,
        childMode
      });

      if (state.type !== "question") {
        await interaction.editReply({
          content: "Could not start Akinator question properly."
        });
        return;
      }

      const embed = questionEmbed(
        interaction.user,
        state.question,
        0,
        state.progress || 0
      );
      const answerRow = buildAnswerRow();
      const controlRow = buildControlRow();

      await interaction.editReply({
        embeds: [embed],
        components: [answerRow, controlRow]
      });
    } catch (err) {
      console.error("Akinator start error:", err);
      await interaction.editReply({ content: "❌ Failed to start Akinator game." });
    }
  },

  // Button handler (uses Puppeteer manager)
  async handleButton(client, interaction) {
    try {
      // Stop button
      if (interaction.customId === "aki_stop") {
        await interaction.deferUpdate();
        await puppetManager.stopGame(interaction.user.id);
        const embed = stoppedEmbed(interaction.user);
        await interaction.message.edit({ embeds: [embed], components: [] });
        return;
      }

      await interaction.deferUpdate();

      const state = await puppetManager.handleAnswer(
        interaction.user.id,
        interaction.customId
      );

      if (state.type === "question") {
        const embed = questionEmbed(
          interaction.user,
          state.question,
          0,
          state.progress || 0
        );
        const answerRow = buildAnswerRow();
        const controlRow = buildControlRow();

        await interaction.message.edit({
          embeds: [embed],
          components: [answerRow, controlRow]
        });
      } else if (state.type === "guess") {
        const embed = guessEmbed(interaction.user, state.guess, true);
        const row = buildPlayAgainRow();
        await interaction.message.edit({
          embeds: [embed],
          components: [row]
        });
      } else {
        await interaction.message.edit({
          content: "❌ Unexpected game state.",
          components: []
        });
      }
    } catch (err) {
      console.error("Akinator button error:", err);
      // interaction is already deferred; just log
    }
  }
};
