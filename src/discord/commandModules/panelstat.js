const { SlashCommandBuilder } = require('discord.js');
const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply } = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
  .setName('panelstat')
  .setDescription('Create server control panel')
  .addStringOption(option =>
    option
      .setName('servername')
      .setDescription('Server key')
      .setRequired(true)
  );

async function execute(client, interaction) {
  if (!(await hasAccess(interaction))) {
    return interaction.reply(noPermissionReply());
  }

  // ✅ ACK immediately to avoid 10062
  await interaction.deferReply({ ephemeral: true });

  const key = interaction.options.getString('servername').toLowerCase();

  if (!serverManager.getServer(key)) {
    return interaction.editReply('❌ Server not found');
  }

  try {
    await panelManager.createPanel(interaction, key);
    return interaction.editReply('✅ Panel created');
  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to create panel');
  }
}

module.exports = { data, execute };