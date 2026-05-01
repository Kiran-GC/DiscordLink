const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const panelManager = require("../../services/panelManager");

module.exports = async function handleAdminPanel(interaction, client) {

  // Dropdown select
  if (interaction.isStringSelectMenu() && interaction.customId === "admin_select_server") {
    const key = interaction.values[0];

    await interaction.deferReply({ ephemeral: true });

    const msg = await interaction.editReply({
      content: `⚙️ Control panel for \`${key}\``,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`start_${key}`).setLabel("Start").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`stop_${key}`).setLabel("Stop").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`restart_${key}`).setLabel("Restart").setStyle(ButtonStyle.Primary)
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("close_panel").setLabel("Close ❌").setStyle(ButtonStyle.Secondary)
        )
      ]
    });

    return true;
  }

  // Close button
  if (interaction.isButton() && interaction.customId === "close_panel") {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    return true;
  }

  return false;
};