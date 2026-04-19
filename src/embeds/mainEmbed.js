const { EmbedBuilder } = require('discord.js');
const {
    SERVER_NAME,
    SERVER_DESCRIPTION,
    BRAND_THUMBNAIL,
    LIVE_STATUS_FOOTER,
    MC_PRIMARY_IP,
    MC_SECONDARY_IP
} = require('../config/config');

function buildEmbed(data, options = {}) {
    const { includeIps = true } = options;

    const playerList = data.list.length
        ? data.list.slice(0, 10).map(p => `• ${p}`).join('\n') +
          (data.list.length > 10 ? `\n+ ${data.list.length - 10} more...` : '')
        : 'No players online';

    const fields = [
        { name: '📡 Status', value: `\`\`\`${data.online ? '🟢 Online' : '🔴 Offline'}\`\`\``, inline: true },
        { name: '👥 Players', value: `\`\`\`${data.players} / ${data.max}\`\`\``, inline: true },
        { name: '⚙️ Version', value: `\`\`\`${data.version}\`\`\``, inline: true }
    ];

    if (includeIps) {
        fields.push(
            { name: '🌐 Primary IP', value: `\`\`\`${MC_PRIMARY_IP}\`\`\`` },
            { name: '🌐 Secondary IP', value: `\`\`\`${MC_SECONDARY_IP}\`\`\`` }
        );
    }

    fields.push({ name: '👥 Players Online', value: `\`\`\`\n${playerList}\n\`\`\`` });

    return new EmbedBuilder()
        .setTitle(SERVER_NAME)
        .setDescription(SERVER_DESCRIPTION)
        .setColor(data.online ? 0x22c55e : 0xef4444)
        .setThumbnail(BRAND_THUMBNAIL)
        .addFields(fields)
        .setFooter({ text: LIVE_STATUS_FOOTER })
        .setTimestamp();
}

module.exports = { buildEmbed };