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

    const hasContent =
        data.title ||
        data.description ||
        data.fields.length > 0;

    if (hasContent) {
        if (data.title) embed.setTitle(data.title);
        if (data.description) embed.setDescription(data.description);
    } else {
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
    const embed = buildEmbed(data);

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_content").setLabel("✏️ Content").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("eb_style").setLabel("🎨 Style").setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_add_field").setLabel("➕ Add Field").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("eb_edit_field").setLabel("✏️ Edit Field").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("eb_remove_field").setLabel("❌ Remove Field").setStyle(ButtonStyle.Danger)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_media").setLabel("🖼️ Media").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("eb_extras").setLabel("⚙️ Extras").setStyle(ButtonStyle.Secondary)
    );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_submit").setLabel("✅ Submit").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("eb_cancel").setLabel("❌ Cancel").setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row1, row2, row3, row4] };
}

// ===== START BUILDER =====
async function startBuilder(interaction) {

    // 🔥 CRITICAL: ACK IMMEDIATELY
    try {
        await interaction.deferReply();
    } catch (err) {
        console.log("⚠️ Defer failed:", err.message);
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

    try {
        await interaction.editReply(createUI(data));
        const msg = await interaction.fetchReply();

        sessions.set(interaction.user.id, {
            data,
            messageId: msg.id,
            channelId: msg.channel.id
        });

    } catch (err) {
        console.log("❌ Builder init failed:", err.message);
    }
}

// ===== UPDATE MESSAGE =====
async function updateMessage(interaction, session) {
    try {
        const channel = await interaction.client.channels.fetch(session.channelId);
        const msg = await channel.messages.fetch(session.messageId);
        await msg.edit(createUI(session.data));
    } catch (err) {
        console.log("⚠️ Update failed:", err.message);
    }
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

        // ===== SUBMIT (DROPDOWN) =====
        if (interaction.customId === "eb_submit") {

            const select = new ChannelSelectMenuBuilder()
                .setCustomId("eb_channel_select")
                .setPlaceholder("Select a channel")
                .addChannelTypes(ChannelType.GuildText);

            const row = new ActionRowBuilder().addComponents(select);

            return interaction.reply({
                content: "📍 Select a channel:",
                components: [row],
                ephemeral: true
            });
        }

        // ===== ADD FIELD =====
        if (interaction.customId === "eb_add_field") {
            const modal = new ModalBuilder()
                .setCustomId("modal_field_add")
                .setTitle("Add Field");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fname").setLabel("Field Name").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fvalue").setLabel("Field Value").setStyle(TextInputStyle.Paragraph)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("code").setLabel("Code Block? (yes/no)").setStyle(TextInputStyle.Short).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== EDIT FIELD =====
        if (interaction.customId === "eb_edit_field") {
            const modal = new ModalBuilder()
                .setCustomId("modal_field_edit")
                .setTitle("Edit Field");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("index").setLabel("Field Number").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fname").setLabel("New Name").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fvalue").setLabel("New Value").setStyle(TextInputStyle.Paragraph)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== REMOVE FIELD =====
        if (interaction.customId === "eb_remove_field") {
            const modal = new ModalBuilder()
                .setCustomId("modal_field_remove")
                .setTitle("Remove Field");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("index").setLabel("Field Number").setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== CONTENT =====
        if (interaction.customId === "eb_content") {
            const modal = new ModalBuilder()
                .setCustomId("modal_content")
                .setTitle("Content");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("title").setLabel("Title").setStyle(TextInputStyle.Short).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("desc").setLabel("Description").setStyle(TextInputStyle.Paragraph).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== STYLE =====
        if (interaction.customId === "eb_style") {
            const modal = new ModalBuilder()
                .setCustomId("modal_style")
                .setTitle("Style");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("color").setLabel("Hex Color").setStyle(TextInputStyle.Short).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("footer").setLabel("Footer").setStyle(TextInputStyle.Short).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== MEDIA =====
        if (interaction.customId === "eb_media") {
            const modal = new ModalBuilder()
                .setCustomId("modal_media")
                .setTitle("Media");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("thumbnail").setLabel("Thumbnail URL").setStyle(TextInputStyle.Short).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("image").setLabel("Image URL").setStyle(TextInputStyle.Short).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }

        // ===== EXTRAS =====
        if (interaction.customId === "eb_extras") {
            const modal = new ModalBuilder()
                .setCustomId("modal_extras")
                .setTitle("Extras");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("author").setLabel("Author Name").setStyle(TextInputStyle.Short).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("icon").setLabel("Author Icon URL").setStyle(TextInputStyle.Short).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }
    }

    // ===== CHANNEL SELECT =====
    if (interaction.isChannelSelectMenu() && interaction.customId === "eb_channel_select") {

        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply({ content: "❌ Invalid channel.", ephemeral: true });
        }

        await channel.send({ embeds: [buildEmbed(data)] });

        try {
            const builderChannel = await interaction.client.channels.fetch(session.channelId);
            const builderMsg = await builderChannel.messages.fetch(session.messageId);
            await builderMsg.delete();
        } catch {}

        sessions.delete(interaction.user.id);

        return interaction.update({
            content: "✅ Embed sent!",
            components: []
        });
    }

    // ===== MODALS =====
    if (interaction.isModalSubmit()) {

        const d = interaction.fields;

        if (interaction.customId === "modal_content") {
            data.title = d.getTextInputValue("title");
            data.description = d.getTextInputValue("desc");
        }

        if (interaction.customId === "modal_style") {
            const c = d.getTextInputValue("color");
            if (c) data.color = parseInt(c.replace("#", ""), 16);
            data.footer = d.getTextInputValue("footer");
        }

        if (interaction.customId === "modal_field_add") {
            let value = d.getTextInputValue("fvalue");

            if (d.getTextInputValue("code")?.toLowerCase() === "yes") {
                value = `\`\`\`\n${value}\n\`\`\``;
            }

            data.fields.push({ name: d.getTextInputValue("fname"), value, inline: false });
        }

        if (interaction.customId === "modal_field_edit") {
            const index = parseInt(d.getTextInputValue("index")) - 1;
            if (isNaN(index) || !data.fields[index]) {
                return interaction.reply({ content: "❌ Invalid field.", ephemeral: true });
            }
            data.fields[index] = {
                name: d.getTextInputValue("fname"),
                value: d.getTextInputValue("fvalue"),
                inline: false
            };
        }

        if (interaction.customId === "modal_field_remove") {
            const index = parseInt(d.getTextInputValue("index")) - 1;
            if (isNaN(index) || !data.fields[index]) {
                return interaction.reply({ content: "❌ Invalid field.", ephemeral: true });
            }
            data.fields.splice(index, 1);
        }

        if (interaction.customId === "modal_media") {
            data.thumbnail = d.getTextInputValue("thumbnail");
            data.image = d.getTextInputValue("image");
        }

        if (interaction.customId === "modal_extras") {
            data.author = d.getTextInputValue("author");
            const icon = d.getTextInputValue("icon");
            data.authorIcon = icon && icon.startsWith("http") ? icon : null;
        }

        await interaction.deferUpdate();
        await updateMessage(interaction, session);
    }
}

module.exports = { startBuilder, handleBuilder };