function applyModalSubmission(data, interaction) {
    const fields = interaction.fields;

    if (interaction.customId === 'modal_content') {
        data.title = fields.getTextInputValue('title');
        data.description = fields.getTextInputValue('desc');
        return { error: null };
    }

    if (interaction.customId === 'modal_style') {
        const color = fields.getTextInputValue('color');
        if (color) data.color = parseInt(color.replace('#', ''), 16);
        data.footer = fields.getTextInputValue('footer');
        return { error: null };
    }

    if (interaction.customId === 'modal_field_add') {
        let value = fields.getTextInputValue('fvalue');

        if (fields.getTextInputValue('code')?.toLowerCase() === 'yes') {
            value = `\`\`\`\n${value}\n\`\`\``;
        }

        data.fields.push({
            name: fields.getTextInputValue('fname'),
            value,
            inline: false
        });

        return { error: null };
    }

    if (interaction.customId === 'modal_field_edit') {
        const index = parseInt(fields.getTextInputValue('index')) - 1;
        if (isNaN(index) || !data.fields[index]) {
            return { error: 'invalidFieldNumber' };
        }

        data.fields[index] = {
            name: fields.getTextInputValue('fname'),
            value: fields.getTextInputValue('fvalue'),
            inline: false
        };

        return { error: null };
    }

    if (interaction.customId === 'modal_field_remove') {
        const index = parseInt(fields.getTextInputValue('index')) - 1;
        if (isNaN(index) || !data.fields[index]) {
            return { error: 'invalidFieldNumber' };
        }

        data.fields.splice(index, 1);
        return { error: null };
    }

    if (interaction.customId === 'modal_media') {
        data.thumbnail = fields.getTextInputValue('thumbnail');
        data.image = fields.getTextInputValue('image');
        return { error: null };
    }

    if (interaction.customId === 'modal_extras') {
        data.author = fields.getTextInputValue('author');
        const icon = fields.getTextInputValue('icon');
        data.authorIcon = icon && icon.startsWith('http') ? icon : null;
        return { error: null };
    }

    return { error: null };
}

module.exports = { applyModalSubmission };