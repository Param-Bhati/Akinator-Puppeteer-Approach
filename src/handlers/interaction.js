// src/handlers/interaction.js

module.exports = async (client, interaction) => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      console.log("Slash command used:", interaction.commandName);
      const command = client.commands.get(interaction.commandName);
      console.log("Loaded command:", !!command);
      if (!command) return;
      await command.execute(client, interaction);
      return;
    }

    // Buttons / other interactions (for Akinator later)
    if (interaction.isButton()) {
      const command = client.commands.get("akinator");
      if (command && command.handleButton) {
        await command.handleButton(client, interaction);
      }
      return;
    }
  } catch (error) {
    console.error("Interaction handler error:", error);
    if (interaction.isRepliable()) {
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "❌ An error occurred.",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "❌ An error occurred.",
            ephemeral: true
          });
        }
      } catch {
        // ignore follow-up errors
      }
    }
  }
};
