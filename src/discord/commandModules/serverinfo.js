const { SlashCommandBuilder } = require('discord.js');
const { getStatus } = require('../../mc/status');
const { buildEmbed } = require('../../embeds/mainEmbed');
const { MC_HOST, MC_PORT } = require('../../config/config');

const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show the current server information');

async function execute(client, interaction) {
    const status = await getStatus(`${MC_HOST}:${MC_PORT}`);
    return interaction.reply({ embeds: [buildEmbed(status, { includeIps: false })] });
}

module.exports = { data, execute };