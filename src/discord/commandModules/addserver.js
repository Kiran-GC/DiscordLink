const { SlashCommandBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, ephemeralReply } = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
    .setName('addserver')
    .setDescription('Add a new server')
    .addStringOption(option =>
        option.setName('key').setDescription('Server key').setRequired(true)
    )
    .addStringOption(option =>
        option.setName('name').setDescription('Display name').setRequired(true)
    )
    .addStringOption(option =>
        option.setName('uuid').setDescription('Server UUID').setRequired(true)
    );

async function execute(client, interaction) {
    if (!hasAccess(interaction)) {
        return interaction.reply(noPermissionReply());
    }

    const key = interaction.options.getString('key').toLowerCase();
    const name = interaction.options.getString('name');
    const uuid = interaction.options.getString('uuid');

    try {
        serverManager.addServer(key, name, uuid);
        return interaction.reply(ephemeralReply('✅ Server added'));
    } catch (err) {
        return interaction.reply(ephemeralReply(`❌ ${err.message}`));
    }
}

module.exports = { data, execute };