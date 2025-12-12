const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show Akinator bot statistics."),
  async execute(client, interaction) {
    const { gamesPlayed, gamesWon } = client.stats;
    const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : "0.0";

    const embed = new EmbedBuilder()
      .setTitle("📊 Akinator Stats")
      .addFields(
        { name: "Games played", value: `${gamesPlayed}`, inline: true },
        { name: "Games won", value: `${gamesWon}`, inline: true },
        { name: "Win rate", value: `${winRate}%`, inline: true },
        { name: "Servers", value: `${client.guilds.cache.size}`, inline: true }
      )
      .setColor(0xffa500)
      .setFooter({ text: "BotWorks.Inc • 2025 • made with ❤️ by DualFactor12" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
