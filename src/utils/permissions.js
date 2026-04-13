const { ALLOWED_ROLE_ID } = require('../config/config');

function hasAccess(interaction) {
    return interaction.member?.roles?.cache?.has(ALLOWED_ROLE_ID);
}

module.exports = { hasAccess };