const { VERIFY_CHANNEL_ID } = require('../config/config');

function initVerifyGuard(client) {
    client.on("messageCreate", async (message) => {
        try {
            if (message.channel.id !== VERIFY_CHANNEL_ID) return;

            // Delete user messages instantly
            if (!message.author.bot) {
                await message.delete().catch(() => {});
            }

            // Auto-delete ALL messages after 1 minute
            setTimeout(async () => {
                try {
                    if (message.deletable) {
                        await message.delete();
                    }
                } catch {}
            }, 60 * 1000);

        } catch (err) {
            console.log("Verify channel error:", err);
        }
    });
}

module.exports = { initVerifyGuard };