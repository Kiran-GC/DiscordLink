const { SlashCommandBuilder } = require('discord.js');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');

const data = new SlashCommandBuilder()
  .setName('panelstat')
  .setDescription('Create server panel')
  .addStringOption(option =>
    option.setName('servername').setDescription('Server key').setRequired(true)
  );

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true }); // ✅ FIRST

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    const key = interaction.options.getString('servername').toLowerCase();

    const server = await serverManager.getServer(key);
    if (!server) {
      return interaction.editReply('❌ Server not found');
    }

    await panelManager.createPanel(interaction, key);

    return interaction.editReply('✅ Panel created');

  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to create panel');
  }
}

module.exports = { data, execute };