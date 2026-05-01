const ptero = require('../../services/pterodactylClient');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, ephemeralReply } = require('../../utils/interactionReplies');

const cooldowns = new Map();

module.exports = async function handlePanel(interaction, client) {
    if (!interaction.isButton()) return false;

    if (!interaction.customId.includes('_')) return false;

    const [action, key] = interaction.customId.split('_');

    if (!['start', 'stop', 'restart'].includes(action)) return false;

    if (!hasAccess(interaction)) {
        await interaction.reply(noPermissionReply());
        return true;
    }

    const server = serverManager.getServer(key);
    if (!server) return true;

    const cdKey = `${interaction.user.id}_${action}`;
    const now = Date.now();

    if (cooldowns.has(cdKey) && now - cooldowns.get(cdKey) < 10000) {
        await interaction.reply(ephemeralReply('⏳ Please wait before using again'));
        return true;
    }

    cooldowns.set(cdKey, now);

    await interaction.deferReply({ ephemeral: true });

    try {
        await ptero.power(server.id, action);
        await panelManager.updatePanel(client, interaction.channelId);
        await interaction.editReply('✅ Action executed');
    } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Failed to execute');
    }

    return true;
};