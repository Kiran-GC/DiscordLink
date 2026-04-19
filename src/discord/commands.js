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
                .setDescription('Server IP')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('tutorials')
        .setDescription('Create or update tutorial panel'),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Open embed builder'),

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Show both Adholokham MC server IPs')
];

module.exports = { commands };