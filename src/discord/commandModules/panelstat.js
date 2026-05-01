const { SlashCommandBuilder } = require('discord.js');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, ephemeralReply } = require('../../utils/interactionReplies');
const { safeReply } = require('../../utils/safeReply');

const data = new SlashCommandBuilder()
    .setName('panelstat')
    .setDescription('Create server control panel')
    .addStringOption(option =>
        option
            .setName('servername')
            .setDescription('Server key')
            .setRequired(true)
    );

async function execute(client, interaction) {
    if (!(await hasAccess(interaction))) {
        return safeReply(interaction, noPermissionReply());
    }

    const key = interaction.options.getString('servername').toLowerCase();

    if (!serverManager.getServer(key)) {
        return safeReply(interaction, ephemeralReply('❌ Server not found'));
    }

    return panelManager.createPanel(interaction, key);
}

module.exports = { data, execute };