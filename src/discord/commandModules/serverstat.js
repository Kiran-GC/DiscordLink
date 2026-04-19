const { SlashCommandBuilder } = require('discord.js');
const { getStatus } = require('../../mc/status');
const { buildEmbed } = require('../../embeds/mainEmbed');
const { savePanel, loadPanel, clearPanel } = require('../../utils/storage');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, panelUpdatedReply } = require('../../utils/interactionReplies');
const { isUnknownMessageError } = require('../../utils/discordErrors');
const { startUpdater, setMessage } = require('../../systems/updater');
const { CHANNEL_ID, MC_HOST, MC_PORT } = require('../../config/config');

const data = new SlashCommandBuilder()
    .setName('serverstat')
    .setDescription('Create or update MC status panel');

async function execute(client, interaction) {
    if (!hasAccess(interaction)) {
        return interaction.reply(noPermissionReply());
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    const status = await getStatus(`${MC_HOST}:${MC_PORT}`);

    let panelMessage = null;
    const savedId = loadPanel();

    if (savedId) {
        try {
            panelMessage = await channel.messages.fetch(savedId);
        } catch (error) {
            if (isUnknownMessageError(error)) {
                clearPanel();
            } else {
                throw error;
            }
        }
    }

    if (panelMessage) {
        await panelMessage.edit({ embeds: [buildEmbed(status)] });
    } else {
        panelMessage = await channel.send({ embeds: [buildEmbed(status)] });
        savePanel(panelMessage.id);
    }

    setMessage(panelMessage);
    startUpdater(channel);

    return interaction.reply(panelUpdatedReply());
}

module.exports = { data, execute };