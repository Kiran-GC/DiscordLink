const { SlashCommandBuilder } = require('discord.js');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply } = require('../../utils/interactionReplies');
const { startBuilder } = require('../../systems/embedBuilder/builder');

const data = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Open embed builder');

async function execute(client, interaction) {
    if (!hasAccess(interaction)) {
        return interaction.reply(noPermissionReply());
    }

    return startBuilder(interaction);
}

module.exports = { data, execute };