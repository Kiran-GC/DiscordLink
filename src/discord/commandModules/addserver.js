const { SlashCommandBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { upsertAdminPanel } = require('../../systems/adminPanel/adminPanelManager');

const data = new SlashCommandBuilder()
  .setName('addserver')
  .setDescription('Add a server')
  .addStringOption(option =>
    option.setName('key').setDescription('Server key').setRequired(true))
  .addStringOption(option =>
    option.setName('name').setDescription('Server name').setRequired(true))
  .addStringOption(option =>
    option.setName('uuid').setDescription('Server UUID').setRequired(true));

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    const key = interaction.options.getString('key').toLowerCase();
    const name = interaction.options.getString('name');
    const uuid = interaction.options.getString('uuid');

    await serverManager.addServer(key, name, uuid);

    // ✅ AUTO UPDATE PANEL
    await upsertAdminPanel(client);

    return interaction.editReply('✅ Server added');

  } catch (err) {
    if (err.message.includes('already exists')) {
      return interaction.editReply('⚠️ Server key already exists');
    }

    console.error(err);
    return interaction.editReply('❌ Failed to add server');
  }
}

module.exports = { data, execute };