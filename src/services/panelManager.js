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

function statusText(state) {
  if (state === "running") return "🟢 Online";
  if (state === "starting") return "🟡 Starting";
  return "🔴 Offline";
}

function buildEmbed(server, state) {
  return new EmbedBuilder()
    .setTitle("🖥 Server Control Panel")
    .addFields(
      { name: "Server", value: server.name, inline: true },
      { name: "Status", value: statusText(state), inline: true }
    )
    .setTimestamp();
}

function buildButtons(key) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`start_${key}`).setLabel("Start").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`stop_${key}`).setLabel("Stop").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`restart_${key}`).setLabel("Restart").setStyle(ButtonStyle.Primary)
  );
}

async function updatePanel(client, channelId) {
  const panel = panels.get(channelId);
  if (!panel) return;

  const server = serverManager.getServer(panel.serverKey);
  if (!server) return;

  const channel = await client.channels.fetch(channelId);
  const msg = await channel.messages.fetch(panel.messageId);

  const state = await ptero.getState(server.id);

  await msg.edit({ embeds: [buildEmbed(server, state)] });
}

function startPolling(client, channelId) {
  if (intervals.has(channelId)) return;

  const int = setInterval(() => {
    updatePanel(client, channelId).catch(() => {});
  }, 10000);

  intervals.set(channelId, int);
}

async function createPanel(interaction, key) {
  const server = serverManager.getServer(key);
  if (!server) {
    return interaction.reply({ content: "❌ Server not found", ephemeral: true });
  }

  const state = await ptero.getState(server.id);

  const msg = await interaction.channel.send({
    embeds: [buildEmbed(server, state)],
    components: [buildButtons(key)]
  });

  panels.set(interaction.channel.id, {
    messageId: msg.id,
    serverKey: key
  });

  startPolling(interaction.client, interaction.channel.id);

  return interaction.reply({ content: "✅ Panel created", ephemeral: true });
}

module.exports = { createPanel, updatePanel };