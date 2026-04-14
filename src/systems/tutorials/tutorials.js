const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');

const { tutorials } = require('./data');

const sessions = new Map();

// 🎨 BRAND SETTINGS
const BRAND_COLOR = 0x22c55e; // same green you used before
const BRAND_THUMBNAIL = "https://cdn.discordapp.com/attachments/786154341638864917/1492544844554305698/PNG.png";

// ===== PANEL =====
function createPanel() {
    const embed = new EmbedBuilder()
        .setTitle("📚 Adholokham MC • Tutorials")
        .setDescription(
            "Welcome to **Adholokham MC (OmniCraft)**.\n\n" +
            "Use the dropdown below to access detailed step-by-step guides.\n" +
            "These tutorials will help you get started quickly."
        )
        .setColor(BRAND_COLOR)
        .setThumbnail(BRAND_THUMBNAIL)
        .setFooter({ text: "Adholokham MC • Getting Started" });

    const menu = new StringSelectMenuBuilder()
        .setCustomId("tutorial_select")
        .setPlaceholder("Select a tutorial...")
        .addOptions([
            {
                label: "Verify Yourself",
                value: "verify",
                emoji: "🔐",
                description: "Access the server and link your account"
            },
            {
                label: "Install OmniCraft",
                value: "install",
                emoji: "📦",
                description: "Set up the modpack correctly"
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
        .setColor(BRAND_COLOR)
        .setThumbnail(BRAND_THUMBNAIL)
        .setFooter({ text: `Page ${pageIndex + 1} / ${total} • Adholokham MC` });

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