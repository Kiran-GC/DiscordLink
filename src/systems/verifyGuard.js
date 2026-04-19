const { VERIFY_CHANNEL_ID } = require('../config/config');

function initVerifyGuard(client) {
    client.on("messageCreate", async (message) => {
        try {
            if (message.channel.id !== VERIFY_CHANNEL_ID) return;

            // ❌ Delete ONLY user messages
            if (!message.author.bot) {
                await message.delete().catch(() => {});
            }

            // ✅ Do NOTHING for bot messages (keep embed permanent)

        } catch (err) {
            console.log("Verify channel error:", err);
        }
    });
}

module.exports = { initVerifyGuard };