const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const serverManager = require('../../services/serverManager');
const { hasAccess } = require('../../utils/permissions');

const data = new SlashCommandBuilder()
  .setName('listservers')
  .setDescription('List all servers');

async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true }); // ✅ FIRST

  try {
    if (!(await hasAccess(interaction))) {
      return interaction.editReply('❌ No permission');
    }

    const servers = await serverManager.getAllServers();

    if (!servers.length) {
      return interaction.editReply('⚠️ No servers configured');
    }

    const embed = new EmbedBuilder()
      .setTitle('📦 Servers')
      .setDescription(
        servers.map(s => `• **${s.key}** → \`${s.id}\``).join('\n')
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