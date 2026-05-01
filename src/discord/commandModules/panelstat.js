const { SlashCommandBuilder } = require('discord.js');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { ephemeralReply } = require('../../utils/interactionReplies');

const ADMIN_ROLE_ID = "YOUR_ROLE_ID";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panelstat')
    .setDescription('Create server control panel')
    .addStringOption(option =>
      option
        .setName('servername')
        .setDescription('Server key')
        .setRequired(true)
    ),

  async execute(client, interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply(ephemeralReply('❌ No permission'));
    }

    const key = interaction.options.getString('servername').toLowerCase();

    if (!serverManager.getServer(key)) {
      return interaction.reply(ephemeralReply('❌ Server not found'));
    }

    return panelManager.createPanel(interaction, key);
  }
};