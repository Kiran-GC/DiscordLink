const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { buildSimpleEmbed } = require('../embeds/simpleEmbed');
const { savePanel, loadPanel } = require('../utils/storage');
const { hasAccess } = require('../utils/permissions');
const { startUpdater, setMessage } = require('../systems/updater');
const { CHANNEL_ID, MC_HOST, MC_PORT } = require('../config/config');
const { AttachmentBuilder } = require('discord.js');

async function handleInteraction(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (!hasAccess(interaction)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
    }

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (interaction.commandName === 'serverstat') {
        const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

        let msg;
        const savedId = loadPanel();

        if (savedId) {
            try { msg = await channel.messages.fetch(savedId); } catch {}
        }

        if (msg) {
            await msg.edit({ embeds: [buildEmbed(data)] });
        } else {
            msg = await channel.send({ embeds: [buildEmbed(data)] });
            savePanel(msg.id);
        }

        setMessage(msg);
        startUpdater(channel);

        return interaction.reply({ content: "✅ Panel updated!", ephemeral: true });
    }

    if (interaction.commandName === 'mcsrv') {
        const ip = interaction.options.getString('ip');
        const data = await getStatus(ip);

        const embed = buildSimpleEmbed(data, ip);
        let files = [];

        if (data.icon?.startsWith("data:image")) {
            const buffer = Buffer.from(data.icon.split(",")[1], "base64");
            const attachment = new AttachmentBuilder(buffer, { name: "icon.png" });
            files.push(attachment);
            embed.setThumbnail("attachment://icon.png");
        }

        return interaction.reply({ embeds: [embed], files });
    }
}

module.exports = { handleInteraction };