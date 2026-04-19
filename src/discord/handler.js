const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { buildSimpleEmbed } = require('../embeds/simpleEmbed');
const { buildIpEmbed } = require('../embeds/ipEmbed');
const { savePanel, loadPanel } = require('../utils/storage');
const { hasAccess } = require('../utils/permissions');
const { startUpdater, setMessage } = require('../systems/updater');
const { CHANNEL_ID, MC_HOST, MC_PORT } = require('../config/config');
const { AttachmentBuilder, MessageFlags } = require('discord.js');

// Embed Builder
const { startBuilder, handleBuilder } = require('../systems/embedBuilder/builder');

// Tutorials
const { upsertPanel } = require('../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../systems/tutorials/config');

async function handleInteraction(client, interaction) {

    try {

        // ===============================
        // 🔹 SLASH COMMANDS FIRST (FIXED)
        // ===============================
        if (interaction.isChatInputCommand()) {

            // ===== SERVER PANEL =====
            if (interaction.commandName === 'serverstat') {

                if (!hasAccess(interaction)) {
                    return interaction.reply({
                        content: "❌ You don’t have permission.",
                        flags: MessageFlags.Ephemeral
                    });
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

                return interaction.reply({ content: "✅ Panel updated!", flags: MessageFlags.Ephemeral });
            }

            // ===== MC SRV =====
            if (interaction.commandName === 'mcsrv') {

                const ip = interaction.options.getString('ip');
                const data = await getStatus(ip);

                const embed = buildSimpleEmbed(data, ip);
                let files = [];

                if (data.icon && data.icon.startsWith("data:image")) {
                    const buffer = Buffer.from(data.icon.split(",")[1], "base64");
                    const attachment = new AttachmentBuilder(buffer, { name: "icon.png" });
                    files.push(attachment);
                    embed.setThumbnail("attachment://icon.png");
                }

                return interaction.reply({ embeds: [embed], files });
            }

            // ===== IP COMMAND =====
            if (interaction.commandName === 'ip') {
                return interaction.reply({ embeds: [buildIpEmbed()] });
            }

            // ===== TUTORIAL PANEL =====
            if (interaction.commandName === 'tutorials') {

                if (!hasAccess(interaction)) {
                    return interaction.reply({
                        content: "❌ You don’t have permission.",
                        flags: MessageFlags.Ephemeral
                    });
                }

                const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
                await upsertPanel(client, tutorialChannel);

                return interaction.reply({
                    content: "✅ Tutorial panel updated.",
                    flags: MessageFlags.Ephemeral
                });
            }

            // ===== EMBED BUILDER =====
            if (interaction.commandName === 'embed') {

                if (!hasAccess(interaction)) {
                    return interaction.reply({
                        content: "❌ You don’t have permission.",
                        flags: MessageFlags.Ephemeral
                    });
                }

                return startBuilder(interaction);
            }

            // ===== PING COMMAND =====
            if (interaction.commandName === 'ping') {

                const sent = Date.now();

                await interaction.reply({
                    content: "🏓 Pinging...",
                    flags: MessageFlags.Ephemeral
                });

                const latency = Date.now() - sent;
                const apiPing = Math.round(interaction.client.ws.ping);

                return interaction.editReply({
                    content: `🏓 Pong!\nLatency: ${latency}ms\nAPI: ${apiPing}ms`
                });
            }
        }

        // ===============================
        // 🔹 BUILDER INTERACTIONS AFTER (FIXED)
        // ===============================
        if (
            interaction.isButton() ||
            interaction.isModalSubmit() ||
            interaction.isChannelSelectMenu()
        ) {
            return handleBuilder(interaction);
        }

    } catch (err) {
        console.log("❌ Interaction Error:", err);
    }
}

module.exports = { handleInteraction };