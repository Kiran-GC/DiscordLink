const { EmbedBuilder } = require('discord.js');
const { MC_PRIMARY_IP, MC_SECONDARY_IP } = require('../config/config');

function buildIpEmbed() {
    return new EmbedBuilder()
        .setTitle("🌐 Adholokham MC • Server IPs")
        .setDescription("Use either address below to join OmniCraft. Keep both saved in case one route works better for you.")
        .setColor(0x38bdf8)
        .setThumbnail("https://cdn.discordapp.com/attachments/786154341638864917/1492544844554305698/PNG.png")
        .addFields(
            { name: "Primary IP", value: `\`\`\`${MC_PRIMARY_IP}\`\`\`` },
            { name: "Secondary IP", value: `\`\`\`${MC_SECONDARY_IP}\`\`\`` },
            { name: "Quick Tip", value: "If the first address does not connect, try the second one before troubleshooting further." }
        )
        .setFooter({ text: "Watcher v1 • Connection Info" })
        .setTimestamp();
}

module.exports = { buildIpEmbed };