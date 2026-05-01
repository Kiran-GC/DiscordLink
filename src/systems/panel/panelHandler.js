const ptero = require('../../services/pterodactylClient');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { ephemeralReply } = require('../../utils/interactionReplies');

const ADMIN_ROLE_ID = "YOUR_ROLE_ID";
const cooldowns = new Map();

module.exports = async function handlePanel(interaction, client) {
  if (!interaction.isButton()) return false;

  if (!interaction.customId.includes('_')) return false;

  const [action, key] = interaction.customId.split('_');

  if (!['start', 'stop', 'restart'].includes(action)) return false;

  if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
    await interaction.reply(ephemeralReply("❌ No permission"));
    return true;
  }

  const server = serverManager.getServer(key);
  if (!server) return true;

  const cdKey = `${interaction.user.id}_${action}`;
  const now = Date.now();

  if (cooldowns.has(cdKey) && now - cooldowns.get(cdKey) < 10000) {
    await interaction.reply(ephemeralReply("⏳ Wait before using again"));
    return true;
  }

  cooldowns.set(cdKey, now);

  await interaction.deferReply({ ephemeral: true });

  try {
    await ptero.power(server.id, action);
    await panelManager.updatePanel(client, interaction.channelId);
    await interaction.editReply("✅ Done");
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Failed");
  }

  return true;
};