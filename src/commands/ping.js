const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency."),
  async execute(client, interaction) {
    const sent = Date.now();
    await interaction.reply({ content: "Pinging...", ephemeral: true });
    const diff = Date.now() - sent;
    const wsPing = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setDescription(`Message latency: **${diff}ms**\nWebSocket latency: **${wsPing}ms**`)
      .setColor(0xffa500)
      .setFooter({ text: "BotWorks.Inc " });

    await interaction.editReply({ content: "", embeds: [embed] });
  }
};
