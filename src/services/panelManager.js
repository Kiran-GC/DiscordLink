const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ptero = require("./pterodactylClient");
const serverManager = require("./serverManager");

const panels = new Map();
const intervals = new Map();

/* ---------------- UTIL ---------------- */

function statusText(state) {
  switch (state) {
    case "running":
      return "🟢 Online";
    case "starting":
      return "🟡 Starting";
    case "stopping":
      return "🟠 Stopping";
    case "offline":
    default:
      return "🔴 Offline";
  }
}

// ms → "Xd Ym"
function formatUptime(ms) {
  if (!ms) return "0m";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const minutes = totalMinutes % (60 * 24);
  return days > 0 ? `${days}d ${minutes}m` : `${minutes}m`;
}

/* ---------------- EMBED ---------------- */

function buildEmbed(server, data) {
  const state = data.state;
  const uptime = formatUptime(data.uptime);

  return new EmbedBuilder()
    .setTitle("📡 Server Status")
    .addFields(
      {
        name: "🛰 Status",
        value: `\`${statusText(state)}\``,
        inline: true
      },
      {
        name: "⏱ Uptime",
        value: `\`${uptime}\``,
        inline: true
      },
      {
        name: "🖥 Server",
        value: `\`${server.name}\``,
        inline: false
      }
    )
    .setFooter({ text: "Watcher v1 • Live Status" })
    .setTimestamp();
}

/* ---------------- BUTTONS ---------------- */

function buildButtons(key) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`start_${key}`)
      .setLabel("Start")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`stop_${key}`)
      .setLabel("Stop")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`restart_${key}`)
      .setLabel("Restart")
      .setStyle(ButtonStyle.Primary)
  );
}

/* ---------------- CORE ---------------- */

async function fetchData(serverId) {
  const res = await ptero.client.get(`/servers/${serverId}/resources`);
  const attr = res.data?.attributes || {};

  return {
    // PebbleHost returns `state` (not current_state)
    state: attr.state,
    uptime: attr.resources?.uptime
  };
}

async function updatePanel(client, channelId) {
  const panel = panels.get(channelId);
  if (!panel) return;

  const server = serverManager.getServer(panel.serverKey);
  if (!server) return;

  const channel = await client.channels.fetch(channelId);
  const msg = await channel.messages.fetch(panel.messageId);

  const data = await fetchData(server.id);

  await msg.edit({
    embeds: [buildEmbed(server, data)]
  });
}

/* ---------------- POLLING (30s) ---------------- */

function startPolling(client, channelId) {
  if (intervals.has(channelId)) return;

  const int = setInterval(async () => {
    try {
      await updatePanel(client, channelId);
    } catch (err) {
      console.error("Panel update failed:", err.message);
      // stop spam loop on failure
      clearInterval(intervals.get(channelId));
      intervals.delete(channelId);
    }
  }, 30000); // ✅ 30 seconds

  intervals.set(channelId, int);
}

/* ---------------- CREATE PANEL ---------------- */

async function createPanel(interaction, key) {
  const server = serverManager.getServer(key);
  if (!server) {
    // command handles reply lifecycle
    throw new Error("Server not found");
  }

  const data = await fetchData(server.id);

  const msg = await interaction.channel.send({
    embeds: [buildEmbed(server, data)],
    components: [buildButtons(key)]
  });

  panels.set(interaction.channel.id, {
    messageId: msg.id,
    serverKey: key
  });

  startPolling(interaction.client, interaction.channel.id);

  // ❌ DO NOT reply here (handled by command)
  return;
}

module.exports = { createPanel, updatePanel };