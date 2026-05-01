const { SlashCommandBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');

const data = new SlashCommandBuilder()
  .setName('removeserver')
  .setDescription('Remove a server')
  .addStringOption(option =>
    option.setName('key').setDescription('Server key').setRequired(true)
  );

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true }); // ✅ FIRST

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    const key = interaction.options.getString('key').toLowerCase();

    const removed = await serverManager.removeServer(key);

    if (!removed) {
      return interaction.editReply('❌ Server not found');
    }

    return interaction.editReply(`🗑️ Removed \`${key}\``);

  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to remove server');
  }
}

module.exports = { data, execute };