const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const { getStatus } = require('../../mc/status');
const { buildSimpleEmbed } = require('../../embeds/simpleEmbed');
const { commandCooldownReply } = require('../../utils/interactionReplies');

const COOLDOWN_MS = 5000;
const cooldowns = new Map();

const data = new SlashCommandBuilder()
    .setName('mcsrv')
    .setDescription('Check any Minecraft server')
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('Server IP')
            .setRequired(true)
    );

async function execute(client, interaction) {
    const now = Date.now();
    const userId = interaction.user.id;
    const cooldownUntil = cooldowns.get(userId) || 0;

    if (cooldownUntil > now) {
        const seconds = Math.ceil((cooldownUntil - now) / 1000);
        return interaction.reply(commandCooldownReply(seconds));
    }

    cooldowns.set(userId, now + COOLDOWN_MS);
    setTimeout(() => {
        if ((cooldowns.get(userId) || 0) <= Date.now()) {
            cooldowns.delete(userId);
        }
    }, COOLDOWN_MS);

    const ip = interaction.options.getString('ip');
    const status = await getStatus(ip);

    const embed = buildSimpleEmbed(status, ip);
    const files = [];

    if (status.icon && status.icon.startsWith('data:image')) {
        const buffer = Buffer.from(status.icon.split(',')[1], 'base64');
        const attachment = new AttachmentBuilder(buffer, { name: 'icon.png' });
        files.push(attachment);
        embed.setThumbnail('attachment://icon.png');
    }

    return interaction.reply({ embeds: [embed], files });
}

module.exports = { data, execute };