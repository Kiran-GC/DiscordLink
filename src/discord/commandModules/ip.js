const { SlashCommandBuilder } = require('discord.js');
const { buildIpEmbed } = require('../../embeds/ipEmbed');

const data = new SlashCommandBuilder()
    .setName('ip')
    .setDescription('Show both Adholokham MC server IPs');

async function execute(client, interaction) {
    return interaction.reply({ embeds: [buildIpEmbed()] });
}

module.exports = { data, execute };