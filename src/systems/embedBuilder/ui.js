const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

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
        embed.setDescription('‎');
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

function createUI(data) {
    const embed = buildEmbed(data);

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eb_content').setLabel('✏️ Content').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('eb_style').setLabel('🎨 Style').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eb_add_field').setLabel('➕ Add Field').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('eb_edit_field').setLabel('✏️ Edit Field').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('eb_remove_field').setLabel('❌ Remove Field').setStyle(ButtonStyle.Danger)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eb_media').setLabel('🖼️ Media').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('eb_extras').setLabel('⚙️ Extras').setStyle(ButtonStyle.Secondary)
    );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eb_submit').setLabel('✅ Submit').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('eb_cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row1, row2, row3, row4] };
}

module.exports = { buildEmbed, createUI };