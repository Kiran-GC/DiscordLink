const { SlashCommandBuilder } = require('discord.js');
const { hasAccess } = require('../../utils/permissions');
const { upsertAdminPanel } = require('../../systems/adminPanel/adminPanelManager');

const data = new SlashCommandBuilder()
  .setName('listservers')
  .setDescription('Create or update admin panel');

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    await upsertAdminPanel(client);

    return interaction.editReply('✅ Admin panel created / updated');

  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to update panel');
  }
}

module.exports = { data, execute };