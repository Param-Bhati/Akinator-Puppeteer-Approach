const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show info about the Akinator bot."),
  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Akinator Bot Help")
      .setDescription("Use `/akinator` to start a game where I try to guess your character, animal, or object!\nSupport server: https://discord.gg/FHWeugkdXf")
      .addFields(
        { name: "Main Command", value: "`/akinator` – Start playing Akinator." },
        { name: "Other Commands", value: "`/help`, `/stats`, `/ping`, `/contact`" }
      )
      .setColor(0xffa500)
      .setFooter({ text: "BotWorks.Inc • 2025 • made with ❤️ by DualFactor12" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
