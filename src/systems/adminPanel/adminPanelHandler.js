const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ptero = require("../../services/pterodactylClient");
const serverManager = require("../../services/serverManager");
const panelManager = require("../../services/panelManager");

module.exports = async function handleAdminPanel(interaction, client) {

  /* ---------------- DROPDOWN ---------------- */

  if (interaction.isStringSelectMenu() && interaction.customId === "admin_select_server") {
    const key = interaction.values[0];

    await interaction.deferUpdate();

    try {
      const server = await serverManager.getServer(key);
      if (!server) return true;

      // ✅ Fetch BOTH resources + server info (for name)
      const [resourcesRes, serverRes] = await Promise.all([
        ptero.client.get(`/servers/${server.id}/resources`),
        ptero.client.get(`/servers/${server.id}`)
      ]);

      const attr = resourcesRes.data?.attributes || {};
      const serverAttr = serverRes.data?.attributes || {};

      const data = {
        state: attr.state,
        uptime: attr.resources?.uptime,
        name: serverAttr.name // ✅ REAL NAME FROM PANEL
      };

      const embed = panelManager.buildEmbed(data);

      await interaction.channel.send({
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`start_${key}`).setLabel("Start").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`stop_${key}`).setLabel("Stop").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`restart_${key}`).setLabel("Restart").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("close_panel").setLabel("Close ❌").setStyle(ButtonStyle.Secondary)
          )
        ]
      });

    } catch (err) {
      console.error("Admin dropdown error:", err);
    }

    return true;
  }

  /* ---------------- CLOSE BUTTON ---------------- */

  if (interaction.isButton() && interaction.customId === "close_panel") {
    await interaction.deferUpdate();
    await interaction.message.delete();
    return true;
  }

  return false;
};