const { ALLOWED_ROLE_ID } = require('../config/config');

async function hasAccess(interaction) {
    if (!interaction.guild) return false;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    return member.roles.cache.has(ALLOWED_ROLE_ID);
}

module.exports = { hasAccess };