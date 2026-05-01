const { SlashCommandBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { upsertAdminPanel } = require('../../systems/adminPanel/adminPanelManager');

const data = new SlashCommandBuilder()
  .setName('removeserver')
  .setDescription('Remove a server')
  .addStringOption(option =>
    option.setName('key').setDescription('Server key').setRequired(true)
  );

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    const key = interaction.options.getString('key').toLowerCase();

    const removed = await serverManager.removeServer(key);

    if (!removed) {
      return interaction.editReply('❌ Server not found');
    }

    // ✅ AUTO UPDATE PANEL
    await upsertAdminPanel(client);

    return interaction.editReply(`🗑️ Removed \`${key}\``);

  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to remove server');
  }
}

module.exports = { data, execute };