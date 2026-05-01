const panelManager = require('../../services/panelManager');
const serverManager = require('../../services/serverManager');
const { ephemeralReply } = require('../../utils/interactionReplies');

const ADMIN_ROLE_ID = "YOUR_ROLE_ID";

module.exports = async (client, interaction) => {
  if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return interaction.reply(ephemeralReply("❌ No permission"));
  }

  const key = interaction.options.getString("servername").toLowerCase();

  if (!serverManager.getServer(key)) {
    return interaction.reply(ephemeralReply("❌ Server not found"));
  }

  return panelManager.createPanel(interaction, key);
};