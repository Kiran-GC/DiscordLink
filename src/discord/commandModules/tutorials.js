const { SlashCommandBuilder } = require('discord.js');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, tutorialPanelUpdatedReply } = require('../../utils/interactionReplies');
const { upsertPanel } = require('../../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../../systems/tutorials/config');

const data = new SlashCommandBuilder()
    .setName('tutorials')
    .setDescription('Create or update tutorial panel');

async function execute(client, interaction) {
    if (!hasAccess(interaction)) {
        return interaction.reply(noPermissionReply());
    }

    const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
    await upsertPanel(client, tutorialChannel);

    return interaction.reply(tutorialPanelUpdatedReply());
}

module.exports = { data, execute };