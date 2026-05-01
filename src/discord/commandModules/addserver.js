const serverManager = require('../../services/serverManager');
const { ephemeralReply } = require('../../utils/interactionReplies');

const ADMIN_ROLE_ID = "1418950962890145863";

module.exports = async (client, interaction) => {
  if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return interaction.reply(ephemeralReply("❌ No permission"));
  }

  const key = interaction.options.getString("key").toLowerCase();
  const name = interaction.options.getString("name");
  const uuid = interaction.options.getString("uuid");

  try {
    serverManager.addServer(key, name, uuid);
    return interaction.reply(ephemeralReply("✅ Server added"));
  } catch (err) {
    return interaction.reply(ephemeralReply(`❌ ${err.message}`));
  }
};