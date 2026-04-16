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

// ===== UI =====
function createUI(data) {

    const embed = new EmbedBuilder()
        .setTitle(data.title || "Embed Title")
        .setDescription(data.description || "Embed Description")
        .setColor(data.color || 0x2b2d31)
        .setFooter(data.footer ? { text: data.footer } : null)
        .setAuthor(data.author ? { name: data.author } : null)
        .setThumbnail(data.thumbnail || null)
        .setImage(data.image || null)
        .addFields(data.fields || []);

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
function startBuilder(interaction) {

    sessions.set(interaction.user.id, {
        title: "",
        description: "",
        color: null,
        footer: "",
        author: "",
        thumbnail: "",
        image: "",
        fields: []
    });

    return interaction.reply({
        ...createUI(sessions.get(interaction.user.id)),
        ephemeral: true
    });
}

// ===== HANDLER =====
async function handleBuilder(interaction) {

    const data = sessions.get(interaction.user.id);
    if (!data) return;

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
                    new TextInputBuilder().setCustomId("color").setLabel("Hex Color (#ff0000)").setStyle(TextInputStyle.Short).setRequired(false)
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
                    new TextInputBuilder().setCustomId("channel").setLabel("Channel (#channel)").setStyle(TextInputStyle.Short)
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
            data.fields.push({
                name: d.getTextInputValue("fname"),
                value: d.getTextInputValue("fvalue"),
                inline: false
            });
        }

        if (interaction.customId === "modal_media") {
            data.thumbnail = d.getTextInputValue("thumbnail");
            data.image = d.getTextInputValue("image");
        }

        if (interaction.customId === "modal_extras") {
            data.author = d.getTextInputValue("author");
        }

        if (interaction.customId === "modal_submit") {

            const id = d.getTextInputValue("channel").replace(/[<#>]/g, "");
            const channel = interaction.guild.channels.cache.get(id);

            if (!channel) {
                return interaction.reply({ content: "❌ Invalid channel.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(data.title || null)
                .setDescription(data.description || null)
                .setColor(data.color || 0x2b2d31)
                .setFooter(data.footer ? { text: data.footer } : null)
                .setAuthor(data.author ? { name: data.author } : null)
                .setThumbnail(data.thumbnail || null)
                .setImage(data.image || null)
                .addFields(data.fields);

            await channel.send({ embeds: [embed] });

            sessions.delete(interaction.user.id);

            return interaction.reply({ content: "✅ Embed sent!", ephemeral: true });
        }

        return interaction.update(createUI(data));
    }
}

module.exports = { startBuilder, handleBuilder };