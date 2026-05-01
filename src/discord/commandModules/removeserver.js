const { SlashCommandBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply, ephemeralReply } = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
  .setName('removeserver')
  .setDescription('Remove a server by key')
  .addStringOption(option =>
    option
      .setName('key')
      .setDescription('Server key to remove')
      .setRequired(true)
  );

async function execute(client, interaction) {
  if (!(await hasAccess(interaction))) {
    return interaction.reply(noPermissionReply());
  }

  await interaction.deferReply({ ephemeral: true });

  const key = interaction.options.getString('key').toLowerCase();

  try {
    const removed = await serverManager.removeServer(key);

    if (!removed) {
      return interaction.editReply('❌ Server not found');
    }

    return interaction.editReply(`🗑️ Server \`${key}\` removed`);
  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to remove server');
  }
}

module.exports = { data, execute };