const { AttachmentBuilder } = require('discord.js');
const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { buildSimpleEmbed } = require('../embeds/simpleEmbed');
const { buildIpEmbed } = require('../embeds/ipEmbed');
const { savePanel, loadPanel } = require('../utils/storage');
const { hasAccess } = require('../utils/permissions');
const {
    noPermissionReply,
    panelUpdatedReply,
    tutorialPanelUpdatedReply,
    ephemeralReply
} = require('../utils/interactionReplies');
const { startUpdater, setMessage } = require('../systems/updater');
const { CHANNEL_ID, MC_HOST, MC_PORT } = require('../config/config');
const { startBuilder } = require('../systems/embedBuilder/builder');
const { upsertPanel } = require('../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../systems/tutorials/config');

function replyNoPermission(interaction) {
    return interaction.reply(noPermissionReply());
}

async function handleServerStat(client, interaction) {
    if (!hasAccess(interaction)) {
        return replyNoPermission(interaction);
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

    let msg;
    const savedId = loadPanel();

    if (savedId) {
        try {
            msg = await channel.messages.fetch(savedId);
        } catch {}
    }

    if (msg) {
        await msg.edit({ embeds: [buildEmbed(data)] });
    } else {
        msg = await channel.send({ embeds: [buildEmbed(data)] });
        savePanel(msg.id);
    }

    setMessage(msg);
    startUpdater(channel);

    return interaction.reply(panelUpdatedReply());
}

async function handleMcSrv(interaction) {
    const ip = interaction.options.getString('ip');
    const data = await getStatus(ip);

    const embed = buildSimpleEmbed(data, ip);
    const files = [];

    if (data.icon && data.icon.startsWith('data:image')) {
        const buffer = Buffer.from(data.icon.split(',')[1], 'base64');
        const attachment = new AttachmentBuilder(buffer, { name: 'icon.png' });
        files.push(attachment);
        embed.setThumbnail('attachment://icon.png');
    }

    return interaction.reply({ embeds: [embed], files });
}

function handleIp(interaction) {
    return interaction.reply({ embeds: [buildIpEmbed()] });
}

async function handleTutorialsCommand(client, interaction) {
    if (!hasAccess(interaction)) {
        return replyNoPermission(interaction);
    }

    const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
    await upsertPanel(client, tutorialChannel);

    return interaction.reply(tutorialPanelUpdatedReply());
}

function handleEmbedCommand(interaction) {
    if (!hasAccess(interaction)) {
        return replyNoPermission(interaction);
    }

    return startBuilder(interaction);
}

async function handlePing(interaction) {
    const sent = Date.now();

    await interaction.reply(ephemeralReply('🏓 Pinging...'));

    const latency = Date.now() - sent;
    const apiPing = Math.round(interaction.client.ws.ping);

    return interaction.editReply({
        content: `🏓 Pong!\nLatency: ${latency}ms\nAPI: ${apiPing}ms`
    });
}

const commandHandlers = {
    serverstat: handleServerStat,
    mcsrv: (client, interaction) => handleMcSrv(interaction),
    ip: (client, interaction) => handleIp(interaction),
    tutorials: handleTutorialsCommand,
    embed: (client, interaction) => handleEmbedCommand(interaction),
    ping: (client, interaction) => handlePing(interaction)
};

async function handleInteraction(client, interaction) {
    try {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const handler = commandHandlers[interaction.commandName];
        if (!handler) {
            return;
        }

        return handler(client, interaction);
    } catch (err) {
        console.log('❌ Interaction Error:', err);
    }
}

module.exports = { handleInteraction };