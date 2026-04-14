const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');

const { tutorials } = require('./data');

const sessions = new Map();

// ===== PANEL =====
function createPanel() {
    const embed = new EmbedBuilder()
        .setTitle("📚 OmniCraft Tutorials")
        .setDescription("Select a tutorial below to get started.\n\nAll guides are detailed and step-by-step.");

    const menu = new StringSelectMenuBuilder()
        .setCustomId("tutorial_select")
        .setPlaceholder("Choose a tutorial...")
        .addOptions([
            {
                label: "Verify Yourself",
                value: "verify",
                emoji: "🔐",
                description: "Step-by-step account verification guide"
            },
            {
                label: "Install OmniCraft",
                value: "install",
                emoji: "📦",
                description: "Full modpack installation guide"
            }
        ]);

    return {
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)]
    };
}

// ===== PAGE BUILDER =====
function createPage(tutorialKey, pageIndex) {
    const tutorial = tutorials[tutorialKey];
    const total = tutorial.pages.length;

    const embed = new EmbedBuilder()
        .setTitle(tutorial.title)
        .setDescription(tutorial.pages[pageIndex])
        .setFooter({ text: `Page ${pageIndex + 1} / ${total}` });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setLabel("🎥 Watch Video")
            .setStyle(ButtonStyle.Link)
            .setURL(tutorial.video),

        new ButtonBuilder()
            .setCustomId("close")
            .setLabel("❌")
            .setStyle(ButtonStyle.Danger)
    );

    return {
        embeds: [embed],
        components: [buttons]
    };
}

// ===== HANDLER =====
async function handleTutorials(interaction) {

    // DROPDOWN
    if (interaction.isStringSelectMenu() && interaction.customId === "tutorial_select") {
        const key = interaction.values[0];

        sessions.set(interaction.user.id, {
            key,
            page: 0
        });

        return interaction.reply({
            ...createPage(key, 0),
            ephemeral: true
        });
    }

    // BUTTONS
    if (interaction.isButton()) {
        const session = sessions.get(interaction.user.id);
        if (!session) return;

        if (interaction.customId === "close") {
            sessions.delete(interaction.user.id);
            return interaction.update({
                content: "Closed.",
                embeds: [],
                components: []
            });
        }

        if (interaction.customId === "next") session.page++;
        if (interaction.customId === "prev") session.page--;

        const tutorial = tutorials[session.key];

        session.page = Math.max(0, Math.min(session.page, tutorial.pages.length - 1));

        return interaction.update(createPage(session.key, session.page));
    }
}

module.exports = {
    createPanel,
    handleTutorials
};