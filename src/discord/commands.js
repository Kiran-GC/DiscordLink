const { SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('serverstat')
        .setDescription('Create or update MC status panel'),

    new SlashCommandBuilder()
        .setName('mcsrv')
        .setDescription('Check any Minecraft server')
        .addStringOption(opt =>
            opt.setName('ip')
                .setRequired(true)
                .setDescription('Server IP'))
];

module.exports = { commands };