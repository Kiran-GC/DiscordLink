const { SlashCommandBuilder } = require('discord.js');
const { ephemeralReply } = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency');

async function execute(client, interaction) {
    const sent = Date.now();

    await interaction.reply(ephemeralReply('🏓 Pinging...'));

    const latency = Date.now() - sent;
    const apiPing = Math.round(interaction.client.ws.ping);

    return interaction.editReply({
        content: `🏓 Pong!\nLatency: ${latency}ms\nAPI: ${apiPing}ms`
    });
}

module.exports = { data, execute };