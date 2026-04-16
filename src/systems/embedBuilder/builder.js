const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
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
        new ButtonBuilder().setCustomId("eb_style").setLabel("🎨 Style").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("eb_fields").setLabel("➕ Fields").setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_media").setLabel("🖼️ Media").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("eb_extras").setLabel("⚙️ Extras").setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("eb_submit").setLabel("✅ Submit").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("eb_cancel").setLabel("❌ Cancel").setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row1, row2, row3] };
}

// ===== START =====
async function startBuilder(interaction) {

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

    await interaction.reply(createUI(data));
    const msg = await interaction.fetchReply();

    sessions.set(interaction.user.id, {
        data,
        messageId: msg.id,
        channelId: msg.channel.id
    });
}

// ===== UPDATE MESSAGE =====
async function updateMessage(interaction, session) {
    const channel = interaction.guild.channels.cache.get(session.channelId);
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

        if (interaction.customId === "eb_fields") {
            const modal = new ModalBuilder()
                .setCustomId("modal_field")
                .setTitle("Add Field");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fname").setLabel("Field Name").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("fvalue").setLabel("Field Value").setStyle(TextInputStyle.Paragraph)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("code").setLabel("Use Code Block? (yes/no)").setStyle(TextInputStyle.Short).setRequired(false)
                )
            );

            return interaction.showModal(modal);
        }

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

        if (interaction.customId === "eb_submit") {
            const modal = new ModalBuilder()
                .setCustomId("modal_submit")
                .setTitle("Send Embed");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("channel").setLabel("Channel (#channel or ID)").setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }
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

        if (interaction.customId === "modal_field") {
            let value = d.getTextInputValue("fvalue");

            if (d.getTextInputValue("code")?.toLowerCase() === "yes") {
                value = `\`\`\`\n${value}\n\`\`\``;
            }

            data.fields.push({
                name: d.getTextInputValue("fname"),
                value,
                inline: false
            });
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

        if (interaction.customId === "modal_submit") {

            const id = d.getTextInputValue("channel").replace(/[<#>]/g, "");
            const channel = interaction.guild.channels.cache.get(id);

            if (!channel) {
                return interaction.reply({ content: "❌ Invalid channel.", ephemeral: true });
            }

            const embed = buildEmbed(data);
            await channel.send({ embeds: [embed] });

            // delete builder
            try {
                const builderChannel = interaction.guild.channels.cache.get(session.channelId);
                const builderMsg = await builderChannel.messages.fetch(session.messageId);
                await builderMsg.delete();
            } catch {}

            sessions.delete(interaction.user.id);

            return interaction.reply({
                content: "✅ Embed sent and builder closed.",
                ephemeral: true
            });
        }

        await interaction.deferUpdate();
        await updateMessage(interaction, session);
    }
}

module.exports = { startBuilder, handleBuilder };