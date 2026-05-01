const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');
const { noPermissionReply } = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
  .setName('listservers')
  .setDescription('List all configured servers');

async function execute(client, interaction) {
  if (!(await hasAccess(interaction))) {
    return interaction.reply(noPermissionReply());
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const servers = await serverManager.getAllServers();

    if (!servers.length) {
      return interaction.editReply('⚠️ No servers configured');
    }

    const embed = new EmbedBuilder()
      .setTitle('📦 Configured Servers')
      .setDescription(
        servers
          .map(s => `• **${s.key}** → \`${s.id}\``)
          .join('\n')
      )
      .setFooter({ text: `Total: ${servers.length}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Failed to fetch servers');
  }
}

module.exports = { data, execute };