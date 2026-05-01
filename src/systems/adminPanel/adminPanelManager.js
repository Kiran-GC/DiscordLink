const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const ptero = require("../../services/pterodactylClient");
const serverManager = require("../../services/serverManager");
const { savePanel, loadPanel } = require("./adminStorage");

const CHANNEL_ID = "1499786649599738059";

/* ---------------- STATUS TEXT ---------------- */

function statusText(state) {
  switch (state) {
    case "running":
      return "Online";
    case "starting":
      return "Starting";
    case "stopping":
      return "Stopping";
    case "offline":
    default:
      return "Offline";
  }
}

/* ---------------- STATUS ICON ---------------- */

function statusIcon(state) {
  switch (state) {
    case "running":
      return "🟢";
    case "starting":
      return "🟡";
    case "stopping":
      return "🟠";
    case "offline":
    default:
      return "🔴";
  }
}

/* ---------------- EMBED ---------------- */

async function buildEmbed() {
  const servers = await serverManager.getAllServers();

  let description = "Select a server below to manage it.\n\n";

  if (!servers.length) {
    description += "⚠️ No servers configured";
  } else {
    const lines = await Promise.all(
      servers.map(async (s) => {
        try {
          const [resourcesRes, serverRes] = await Promise.all([
            ptero.client.get(`/servers/${s.id}/resources`),
            ptero.client.get(`/servers/${s.id}`)
          ]);

          const state = resourcesRes.data?.attributes?.state;
          const name = serverRes.data?.attributes?.name;

          return `• ${statusIcon(state)} **${name}** - Status: \`${statusText(state)}\``;

        } catch {
          return `• ⚪ **${s.key}** - Status: \`Unknown\``;
        }
      })
    );

    description += lines.join("\n");
  }

  return new EmbedBuilder()
    .setTitle("🛠 Admin Server Panel")
    .setDescription(description)
    .setFooter({ text: "Admin Panel • Vortex" })
    .setTimestamp();
}

/* ---------------- DROPDOWN ---------------- */

async function buildDropdown() {
  const servers = await serverManager.getAllServers();

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

  // ✅ Use REAL server names for dropdown labels
  const options = await Promise.all(
    servers.slice(0, 25).map(async (s) => {
      try {
        const res = await ptero.client.get(`/servers/${s.id}`);
        const name = res.data?.attributes?.name;

        return {
          label: name || s.key,
          value: s.key
        };
      } catch {
        return {
          label: s.key,
          value: s.key
        };
      }
    })
  );

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("admin_select_server")
      .setPlaceholder("Select a server")
      .addOptions(options)
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
      console.log("⚠️ Admin panel missing, run /listservers to recreate");
      return;
    }
  }

  const embed = await buildEmbed();
  const dropdown = await buildDropdown();

  if (message) {
    await message.edit({
      embeds: [embed],
      components: [dropdown]
    });
  } else {
    const msg = await channel.send({
      embeds: [embed],
      components: [dropdown]
    });

    savePanel(msg.id);
  }
}

module.exports = { upsertAdminPanel };