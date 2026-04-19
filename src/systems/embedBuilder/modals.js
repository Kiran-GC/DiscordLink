const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

function createModal(customId) {
    switch (customId) {
        case 'eb_add_field':
            return new ModalBuilder()
                .setCustomId('modal_field_add')
                .setTitle('Add Field')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('fname').setLabel('Field Name').setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('fvalue').setLabel('Field Value').setStyle(TextInputStyle.Paragraph)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('code').setLabel('Code Block? (yes/no)').setStyle(TextInputStyle.Short).setRequired(false)
                    )
                );

        case 'eb_edit_field':
            return new ModalBuilder()
                .setCustomId('modal_field_edit')
                .setTitle('Edit Field')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('index').setLabel('Field Number (1,2,3...)').setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('fname').setLabel('New Name').setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('fvalue').setLabel('New Value').setStyle(TextInputStyle.Paragraph)
                    )
                );

        case 'eb_remove_field':
            return new ModalBuilder()
                .setCustomId('modal_field_remove')
                .setTitle('Remove Field')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('index').setLabel('Field Number to Remove').setStyle(TextInputStyle.Short)
                    )
                );

        case 'eb_content':
            return new ModalBuilder()
                .setCustomId('modal_content')
                .setTitle('Content')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('title').setLabel('Title').setStyle(TextInputStyle.Short).setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('desc').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(false)
                    )
                );

        case 'eb_style':
            return new ModalBuilder()
                .setCustomId('modal_style')
                .setTitle('Style')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('color').setLabel('Hex Color').setStyle(TextInputStyle.Short).setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('footer').setLabel('Footer').setStyle(TextInputStyle.Short).setRequired(false)
                    )
                );

        case 'eb_media':
            return new ModalBuilder()
                .setCustomId('modal_media')
                .setTitle('Media')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('thumbnail').setLabel('Thumbnail URL').setStyle(TextInputStyle.Short).setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('image').setLabel('Image URL').setStyle(TextInputStyle.Short).setRequired(false)
                    )
                );

        case 'eb_extras':
            return new ModalBuilder()
                .setCustomId('modal_extras')
                .setTitle('Extras')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('author').setLabel('Author Name').setStyle(TextInputStyle.Short).setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('icon').setLabel('Author Icon URL').setStyle(TextInputStyle.Short).setRequired(false)
                    )
                );

        case 'eb_submit':
            return new ModalBuilder()
                .setCustomId('modal_submit')
                .setTitle('Send Embed')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('channel').setLabel('Channel (#channel or ID)').setStyle(TextInputStyle.Short)
                    )
                );

        default:
            return null;
    }
}

module.exports = { createModal };