const { EmbedBuilder } = require('discord.js');

function buildEmbed(data) {
    const playerList = data.list.length
        ? data.list.slice(0, 10).map(p => `• ${p}`).join("\n") +
          (data.list.length > 10 ? `\n+ ${data.list.length - 10} more...` : "")
        : "No players online";

    return new EmbedBuilder()
        .setTitle("Adholokham MC (OmniCraft)")
        .setDescription("Forge-powered OmniCraft experience • Survival • Community-driven gameplay")
        .setColor(data.online ? 0x22c55e : 0xef4444)
        .setThumbnail("https://cdn.discordapp.com/attachments/786154341638864917/1492544844554305698/PNG.png")
        .addFields(
            { name: "📡 Status", value: `\`\`\`${data.online ? "🟢 Online" : "🔴 Offline"}\`\`\``, inline: true },
            { name: "👥 Players", value: `\`\`\`${data.players} / ${data.max}\`\`\``, inline: true },
            { name: "⚙️ Version", value: `\`\`\`${data.version}\`\`\``, inline: true },
            { name: "🌐 Primary IP", value: "```play.gamerluttan.online```" },
            { name: "🌐 Secondary IP", value: "```play.adholokham.online```" },
            { name: "👥 Players Online", value: `\`\`\`\n${playerList}\n\`\`\`` }
        )
        .setFooter({ text: "Watcher v1 • Live Status" })
        .setTimestamp();
}

module.exports = { buildEmbed };