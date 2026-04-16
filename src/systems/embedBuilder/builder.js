const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ChannelSelectMenuBuilder,
    ChannelType
} = require('discord.js');

const sessions = new Map();

// ===== BUILD EMBED =====
function buildEmbed(data) {
    const embed = new EmbedBuilder()
        .setColor(data.color || 0x2b2d31);

    if (data.title) embed.setTitle(data.title);
    if (data.description) embed.setDescription(data.description);
    if (!data.title && !data.description && !data.fields.length) {
        embed.setDescription("‎");
    }

    if (data.footer) embed.setFooter({ text: data.footer });

    if (data.author) {
        embed.setAuthor({
            name: data.author,
            iconURL: data.authorIcon || undefined
        });
    }

    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.image) embed.setImage(data.image);

    if (data.fields.length) embed.addFields(data.fields);

    return embed;
}

// ===== UI =====
function createUI(data) {
    return {
        embeds: [buildEmbed(data)],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("eb_content").setLabel("✏️ Content").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("eb_style").setLabel("🎨 Style").setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("eb_add_field").setLabel("➕ Add Field").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("eb_edit_field").setLabel("✏️ Edit Field").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("eb_remove_field").setLabel("❌ Remove Field").setStyle(ButtonStyle.Danger)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("eb_media").setLabel("🖼️ Media").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("eb_extras").setLabel("⚙️ Extras").setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("eb_submit").setLabel("✅ Submit").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("eb_cancel").setLabel("❌ Cancel").setStyle(ButtonStyle.Danger)
            )
        ]
    };
}

// ===== START =====
async function startBuilder(interaction) {
    try {
        await interaction.deferReply();
    } catch {
        return;
    }

    const data = {
        title: "",
        description: "",
        color: null,
        footer: "",
        author: "",
        authorIcon: "",
        thumbnail: "",
        image: "",
        fields: []
    };

    await interaction.editReply(createUI(data));

    const msg = await interaction.fetchReply();

    sessions.set(interaction.user.id, {
        data,
        messageId: msg.id,
        channelId: msg.channel.id
    });
}

// ===== UPDATE =====
async function updateMessage(interaction, session) {
    const channel = await interaction.client.channels.fetch(session.channelId);
    const msg = await channel.messages.fetch(session.messageId);
    await msg.edit(createUI(session.data));
}

// ===== HANDLER =====
async function handleBuilder(interaction) {

    const session = sessions.get(interaction.user.id);
    if (!session) return;

    const data = session.data;

    // ===== BUTTONS =====
    if (interaction.isButton()) {

        if (interaction.customId === "eb_cancel") {
            sessions.delete(interaction.user.id);
            return interaction.update({ content: "Cancelled.", embeds: [], components: [] });
        }

        // ✅ SUBMIT → DROPDOWN
        if (interaction.customId === "eb_submit") {
            return interaction.reply({
                content: "📍 Select a channel:",
                components: [
                    new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId("eb_channel_select")
                            .addChannelTypes(ChannelType.GuildText)
                    )
                ],
                ephemeral: true
            });
        }

        // ===== MODAL BUTTONS (NO deferUpdate!) =====
        if (interaction.customId === "eb_media") {
            return interaction.showModal(
                new ModalBuilder()
                    .setCustomId("modal_media")
                    .setTitle("Media")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("thumbnail").setLabel("Thumbnail URL").setStyle(TextInputStyle.Short).setRequired(false)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("image").setLabel("Image URL").setStyle(TextInputStyle.Short).setRequired(false)
                        )
                    )
            );
        }

        if (interaction.customId === "eb_extras") {
            return interaction.showModal(
                new ModalBuilder()
                    .setCustomId("modal_extras")
                    .setTitle("Extras")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("author").setLabel("Author Name").setStyle(TextInputStyle.Short).setRequired(false)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("icon").setLabel("Author Icon URL").setStyle(TextInputStyle.Short).setRequired(false)
                        )
                    )
            );
        }

        // (other modals unchanged)
    }

    // ===== CHANNEL SELECT =====
    if (interaction.isChannelSelectMenu()) {

        const channel = interaction.guild.channels.cache.get(interaction.values[0]);
        if (!channel) return;

        await channel.send({ embeds: [buildEmbed(data)] });

        try {
            const builderChannel = await interaction.client.channels.fetch(session.channelId);
            const builderMsg = await builderChannel.messages.fetch(session.messageId);
            await builderMsg.delete();
        } catch {}

        sessions.delete(interaction.user.id);

        return interaction.update({ content: "✅ Sent!", components: [] });
    }

    // ===== MODALS (FIXED PROPERLY) =====
    if (interaction.isModalSubmit()) {

        await interaction.deferReply({ ephemeral: true });

        const d = interaction.fields;

        if (interaction.customId === "modal_media") {
            data.thumbnail = d.getTextInputValue("thumbnail");
            data.image = d.getTextInputValue("image");
        }

        if (interaction.customId === "modal_extras") {
            data.author = d.getTextInputValue("author");
            const icon = d.getTextInputValue("icon");
            data.authorIcon = icon?.startsWith("http") ? icon : null;
        }

        await updateMessage(interaction, session);

        await interaction.deleteReply().catch(() => {});
    }
}

module.exports = { startBuilder, handleBuilder };