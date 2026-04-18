const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { buildSimpleEmbed } = require('../embeds/simpleEmbed');
const { savePanel, loadPanel } = require('../utils/storage');
const { hasAccess } = require('../utils/permissions');
const { startUpdater, setMessage } = require('../systems/updater');
const { CHANNEL_ID, MC_HOST, MC_PORT } = require('../config/config');
const { AttachmentBuilder } = require('discord.js');

// Embed Builder
const { startBuilder, handleBuilder } = require('../systems/embedBuilder/builder');

// Tutorials
const { upsertPanel } = require('../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../systems/tutorials/config');

async function handleInteraction(client, interaction) {

    try {

        // ===============================
        // 🔹 BUILDER (CRITICAL)
        // ===============================
        if (
            interaction.isButton() ||
            interaction.isModalSubmit() ||
            interaction.isChannelSelectMenu()
        ) {
            return handleBuilder(interaction);
        }

        // ===============================
        // 🔹 SLASH COMMANDS
        // ===============================
        if (!interaction.isChatInputCommand()) return;

        const channel = await client.channels.fetch(CHANNEL_ID);

        // ===== SERVER PANEL =====
        if (interaction.commandName === 'serverstat') {

            if (!hasAccess(interaction.member)) {
                return interaction.reply({
                    content: "❌ You don’t have permission.",
                    ephemeral: true
                });
            }

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

            return interaction.reply({ content: "✅ Panel updated!", ephemeral: true });
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

        // ===== TUTORIAL PANEL =====
        if (interaction.commandName === 'tutorials') {

            if (!hasAccess(interaction)) {
                return interaction.reply({
                    content: "❌ You don’t have permission.",
                    ephemeral: true
                });
            }

            const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
            await upsertPanel(client, tutorialChannel);

            return interaction.reply({
                content: "✅ Tutorial panel updated.",
                ephemeral: true
            });
        }

        // ===== EMBED BUILDER =====
        if (interaction.commandName === 'embed') {

            // 🔐 ADDED PERMISSION CHECK
            if (!hasAccess(interaction)) {
                return interaction.reply({
                    content: "❌ You don’t have permission.",
                    ephemeral: true
                });
            }

            return startBuilder(interaction);
        }

    } catch (err) {
        console.log("❌ Interaction Error:", err);
    }
}

module.exports = { handleInteraction };