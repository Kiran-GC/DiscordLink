const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const serverManager = require("../../services/serverManager");
const { savePanel, loadPanel } = require("./adminStorage");

const CHANNEL_ID = "1499786649599738059";

/* ---------------- EMBED ---------------- */

function buildEmbed() {
  return new EmbedBuilder()
    .setTitle("🛠 Admin Server Panel")
    .setDescription("Select a server below to manage it.")
    .setFooter({ text: "Admin Panel • Vortex" })
    .setTimestamp();
}

/* ---------------- DROPDOWN ---------------- */

async function buildDropdown() {
  const servers = await serverManager.getAllServers();

  // ✅ HANDLE EMPTY STATE (prevents Discord 50035 error)
  if (!servers.length) {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("admin_select_server")
        .setPlaceholder("No servers available")
        .setDisabled(true)
        .addOptions([
          {
            label: "No servers configured",
            value: "none"
          }
        ])
    );
  }

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("admin_select_server")
      .setPlaceholder("Select a server")
      .addOptions(
        servers.slice(0, 25).map(s => ({
          label: s.key,
          value: s.key
        }))
      )
  );
}

/* ---------------- UPSERT PANEL ---------------- */

async function upsertAdminPanel(client) {
  const channel = await client.channels.fetch(CHANNEL_ID);

  const savedId = loadPanel();
  let message = null;

  if (savedId) {
    try {
      message = await channel.messages.fetch(savedId);
    } catch {
      message = null;
    }
  }

  const embed = buildEmbed();
  const dropdown = await buildDropdown();

  if (message) {
    await message.edit({
      embeds: [embed],
      components: [dropdown]
    });
  } else {
    message = await channel.send({
      embeds: [embed],
      components: [dropdown]
    });

    savePanel(message.id);
  }
}

module.exports = { upsertAdminPanel };