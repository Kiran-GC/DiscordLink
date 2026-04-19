const { hasAccess } = require('../../utils/permissions');
const {
    noPermissionReply,
    activeEmbedSessionReply,
    invalidFieldNumberReply,
    invalidChannelReply,
    invalidHexColorReply,
    invalidUrlReply,
    botMissingPermissionsReply,
    embedSentReply,
    embedSessionExpiredReply
} = require('../../utils/interactionReplies');
const { isMissingPermissionsError } = require('../../utils/discordErrors');
const { buildEmbed, createUI } = require('./ui');
const { createModal } = require('./modals');
const { applyModalSubmission } = require('./state');
const {
    clearSession,
    getSession,
    setSession,
    fetchSessionMessage,
    getActiveSession
} = require('./session');

const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

function createInitialData() {
    return {
        title: '',
        description: '',
        color: null,
        footer: '',
        author: '',
        authorIcon: '',
        thumbnail: '',
        image: '',
        fields: []
    };
}

function startSessionTimeout(interaction, userId) {
    return setTimeout(async () => {
        try {
            const session = getSession(userId);
            if (!session) return;

            const message = await fetchSessionMessage(interaction.client, session);
            await message.edit({
                content: '⌛ Session expired.',
                embeds: [],
                components: []
            });
        } catch {}

        clearSession(userId);
    }, SESSION_TIMEOUT_MS);
}

async function startBuilder(interaction) {
    if (!hasAccess(interaction)) {
        return interaction.reply(noPermissionReply());
    }

    const existingSession = await getActiveSession(interaction.client, interaction.user.id);
    if (existingSession) {
        return interaction.reply(activeEmbedSessionReply());
    }

    const data = createInitialData();

    if (interaction.deferred || interaction.replied) {
        await interaction.editReply(createUI(data));
    } else {
        await interaction.reply(createUI(data));
    }

    const message = await interaction.fetchReply();
    const timeout = startSessionTimeout(interaction, interaction.user.id);

    setSession(interaction.user.id, {
        data,
        messageId: message.id,
        channelId: message.channel.id,
        timeout
    });
}

async function updateMessage(interaction, session) {
    const message = await fetchSessionMessage(interaction.client, session);
    await message.edit(createUI(session.data));
}

async function handleSubmitModal(interaction, session, data) {
    const channelId = interaction.fields.getTextInputValue('channel').replace(/[<#>]/g, '');
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
        return interaction.reply(invalidChannelReply());
    }

    try {
        await channel.send({ embeds: [buildEmbed(data)] });
    } catch (error) {
        if (isMissingPermissionsError(error)) {
            return interaction.reply(botMissingPermissionsReply());
        }
        throw error;
    }

    try {
        const builderMessage = await fetchSessionMessage(interaction.client, session);
        await builderMessage.delete();
    } catch {}

    clearSession(interaction.user.id);
    return interaction.reply(embedSentReply());
}

async function handleBuilder(interaction) {
    if (!hasAccess(interaction)) return;

    const session = await getActiveSession(interaction.client, interaction.user.id);
    if (!session) {
        if (interaction.isButton() || interaction.isModalSubmit()) {
            return interaction.reply(embedSessionExpiredReply());
        }
        return;
    }

    const data = session.data;

    if (interaction.isButton()) {
        if (interaction.customId === 'eb_cancel') {
            clearSession(interaction.user.id);
            return interaction.update({
                content: 'Cancelled.',
                embeds: [],
                components: []
            });
        }

        const modal = createModal(interaction.customId);
        if (modal) {
            return interaction.showModal(modal);
        }
        return;
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_submit') {
            return handleSubmitModal(interaction, session, data);
        }

        const result = applyModalSubmission(data, interaction);
        if (result.error === 'invalidFieldNumber') {
            return interaction.reply(invalidFieldNumberReply());
        }
        if (result.error === 'invalidHexColor') {
            return interaction.reply(invalidHexColorReply());
        }
        if (result.error === 'invalidUrl') {
            return interaction.reply(invalidUrlReply());
        }

        try {
            await interaction.deferUpdate();
            await updateMessage(interaction, session);
        } catch {
            clearSession(interaction.user.id);
            return interaction.followUp(embedSessionExpiredReply());
        }
    }
}

module.exports = { startBuilder, handleBuilder };