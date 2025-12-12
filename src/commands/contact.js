const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("contact")
    .setDescription("Contact the developer and support team."),
  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📨 Contact & Support")
      .setDescription(
        [
          "**Developer:** @dualfactor12",
          "**Organization:** BotWorks.Inc",
          "**Support server:** https://discord.gg/FHWeugkdXf",
          "**Privacy policy:** https://your-privacy-policy-link-here",
          "If you find a bug or have feedback, please open a ticket in the support server."
        ].join("\n")
      )
      .setColor(0xffa500)
      .setFooter({ text: "BotWorks.Inc • 2026 • made with ❤️ by DualFactor12" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
