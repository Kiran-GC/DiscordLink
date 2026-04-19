const { EmbedBuilder } = require('discord.js');
const {
    SERVER_NAME,
    BRAND_THUMBNAIL,
    CONNECTION_INFO_FOOTER,
    MC_PRIMARY_IP,
    MC_SECONDARY_IP
} = require('../config/config');

function buildIpEmbed() {
    return new EmbedBuilder()
        .setTitle(`🌐 ${SERVER_NAME} • Server IPs`)
        .setDescription('Use either address below to join OmniCraft. Keep both saved in case one route works better for you.')
        .setColor(0x38bdf8)
        .setThumbnail(BRAND_THUMBNAIL)
        .addFields(
            { name: 'Primary IP', value: `\`\`\`${MC_PRIMARY_IP}\`\`\`` },
            { name: 'Secondary IP', value: `\`\`\`${MC_SECONDARY_IP}\`\`\`` },
            { name: 'Quick Tip', value: 'If the first address does not connect, try the second one before troubleshooting further.' }
        )
        .setFooter({ text: CONNECTION_INFO_FOOTER })
        .setTimestamp();
}

module.exports = { buildIpEmbed };