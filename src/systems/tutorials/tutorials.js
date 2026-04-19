const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    MessageFlags
} = require('discord.js');

const { BRAND_THUMBNAIL } = require('../../config/config');
const { tutorialSessionExpiredReply } = require('../../utils/interactionReplies');
const { tutorials } = require('./data');

const sessions = new Map();
const TUTORIAL_BUTTON_IDS = new Set(['prev', 'next', 'close']);
const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

const PANEL_COLOR = 0x8b5cf6;
const PAGE_COLOR = 0xfacc15;

function clearSession(userId) {
    const session = sessions.get(userId);
    if (session?.timeout) clearTimeout(session.timeout);
    sessions.delete(userId);
}

function refreshSessionTimeout(userId) {
    const session = sessions.get(userId);
    if (!session) return;

    if (session.timeout) clearTimeout(session.timeout);
    session.timeout = setTimeout(() => clearSession(userId), SESSION_TIMEOUT_MS);
}

function startSession(userId, key) {
    clearSession(userId);

    sessions.set(userId, {
        key,
        page: 0,
        timeout: null
    });

    refreshSessionTimeout(userId);
    return sessions.get(userId);
}

function createPanel() {
    const embed = new EmbedBuilder()
        .setTitle('📚 Adholokham MC • Tutorials')
        .setDescription(
            'Welcome to **Adholokham MC (OmniCraft)**.\n\n' +
            'Use the dropdown below to access detailed guides.\n' +
            'Follow the steps carefully to get started.'
        )
        .setColor(PANEL_COLOR)
        .setThumbnail(BRAND_THUMBNAIL)
        .setFooter({ text: 'Tutorial Hub • Navigation Panel' });

    const menu = new StringSelectMenuBuilder()
        .setCustomId('tutorial_select')
        .setPlaceholder('Select a tutorial...')
        .addOptions([
            {
                label: 'Verify Yourself',
                value: 'verify',
                emoji: '🔐',
                description: 'Access the server and verify your account'
            },
            {
                label: 'Install OmniCraft',
                value: 'install',
                emoji: '📦',
                description: 'Install and setup the modpack'
            }
        ]);

    return {
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)]
    };
}

function createPage(tutorialKey, pageIndex) {
    const tutorial = tutorials[tutorialKey];
    const total = tutorial.pages.length;

    const embed = new EmbedBuilder()
        .setTitle(tutorial.title)
        .setDescription(tutorial.pages[pageIndex])
        .setColor(PAGE_COLOR)
        .setThumbnail(BRAND_THUMBNAIL)
        .setFooter({ text: `Page ${pageIndex + 1} / ${total} • Adholokham MC` });

    const controls = [
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setLabel('🎥 Watch Video')
            .setStyle(ButtonStyle.Link)
            .setURL(tutorial.video)
    ];

    if (tutorial.downloadUrl) {
        controls.push(
            new ButtonBuilder()
                .setLabel('📥 Download Modpack')
                .setStyle(ButtonStyle.Link)
                .setURL(tutorial.downloadUrl)
        );
    }

    controls.push(
        new ButtonBuilder()
            .setCustomId('close')
            .setLabel('❌')
            .setStyle(ButtonStyle.Danger)
    );

    const buttons = new ActionRowBuilder().addComponents(controls);

    return {
        embeds: [embed],
        components: [buttons]
    };
}

async function upsertPanel(client, channel) {
    const messages = await channel.messages.fetch({ limit: 20 });

    const existing = messages.find(message =>
        message.author.id === client.user.id &&
        message.components.length > 0 &&
        message.components[0]?.components[0]?.customId === 'tutorial_select'
    );

    if (existing) {
        await existing.edit(createPanel());
        console.log('♻️ Tutorial panel updated');
        return;
    }

    await channel.send(createPanel());
    console.log('✅ Tutorial panel created');
}

async function handleTutorials(interaction, client) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'tutorial_select') {
        const key = interaction.values[0];
        startSession(interaction.user.id, key);

        return interaction.reply({
            ...createPage(key, 0),
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.isButton() && TUTORIAL_BUTTON_IDS.has(interaction.customId)) {
        const session = sessions.get(interaction.user.id);
        if (!session) {
            return interaction.reply(tutorialSessionExpiredReply());
        }

        refreshSessionTimeout(interaction.user.id);

        if (interaction.customId === 'close') {
            clearSession(interaction.user.id);
            return interaction.update({
                content: 'Closed.',
                embeds: [],
                components: []
            });
        }

        if (interaction.customId === 'next') session.page++;
        if (interaction.customId === 'prev') session.page--;

        const tutorial = tutorials[session.key];
        session.page = Math.max(0, Math.min(session.page, tutorial.pages.length - 1));

        return interaction.update(createPage(session.key, session.page));
    }
}

module.exports = {
    createPanel,
    handleTutorials,
    upsertPanel
};