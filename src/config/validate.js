const config = require('./config');

const REQUIRED_KEYS = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'GUILD_ID',
    'CHANNEL_ID',
    'ALLOWED_ROLE_ID',
    'VERIFY_CHANNEL_ID'
];

function validateConfig() {
    const missing = REQUIRED_KEYS.filter(key => !config[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required configuration values: ${missing.join(', ')}`);
    }

    return config;
}

module.exports = { validateConfig };