const { EmbedBuilder } = require('discord.js');

function buildSimpleEmbed(data, ip) {
    const playerList = data.list.length
        ? data.list.slice(0, 10).map(p => `• ${p}`).join("\n") +
          (data.list.length > 10 ? `\n+ ${data.list.length - 10} more...` : "")
        : "No players online";

    return new EmbedBuilder()
        .setTitle(`Server Check: ${ip}`)
        .setColor(data.online ? 0x22c55e : 0xef4444)
        .addFields(
            { name: "📡 Status", value: `\`\`\`${data.online ? "🟢 Online" : "🔴 Offline"}\`\`\`` },
            { name: "👥 Players", value: `\`\`\`${data.players} / ${data.max}\`\`\`` },
            { name: "⚙️ Version", value: `\`\`\`${data.version}\`\`\`` },
            { name: "👥 Players Online", value: `\`\`\`\n${playerList}\n\`\`\`` }
        )
        .setFooter({ text: "Watcher v1 • Quick Check" })
        .setTimestamp();
}

module.exports = { buildSimpleEmbed };