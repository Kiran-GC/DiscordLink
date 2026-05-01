const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const serverManager = require("../../services/serverManager");
const { savePanel, loadPanel } = require('./adminStorage');

const CHANNEL_ID = "1499786649599738059";

function buildEmbed() {
  return new EmbedBuilder()
    .setTitle("🛠 Admin Server Panel")
    .setDescription("Select a server below to manage it.")
    .setFooter({ text: "Admin Panel • Vortex" })
    .setTimestamp();
}

async function buildDropdown() {
  const servers = await serverManager.getAllServers();

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("admin_select_server")
      .setPlaceholder("Select a server")
      .addOptions(
        servers.map(s => ({
          label: s.key,
          value: s.key
        }))
      )
  );
}

async function upsertAdminPanel(client) {
  const channel = await client.channels.fetch(CHANNEL_ID);

  const savedId = loadPanel("adminPanel");
  let message;

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

    savePanel("adminPanel", message.id);
  }
}

module.exports = { upsertAdminPanel };