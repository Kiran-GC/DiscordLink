const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { MC_HOST, MC_PORT, NOTIFY_ROLE_ID } = require('../config/config');

let updaterTimeout = null;
let lastData = null;
let statusMessage = null;

function setMessage(msg) {
    statusMessage = msg;
}

// 🔥 helper: auto delete after 5 mins
function autoDelete(message, delay = 5 * 60 * 1000) {
    setTimeout(() => {
        message.delete().catch(() => {});
    }, delay);
}

function startUpdater(channel) {
    if (updaterTimeout) clearTimeout(updaterTimeout);

    async function loop() {

        if (!statusMessage) {
            updaterTimeout = setTimeout(loop, 60000);
            return;
        }

        try {
            const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

            if (
                !lastData ||
                data.players !== lastData.players ||
                data.online !== lastData.online ||
                data.max !== lastData.max
            ) {

                // 🔴 OFFLINE ALERT
                if (lastData !== null && lastData.online && !data.online) {
                    console.log("🚨 Server went OFFLINE");

                    if (NOTIFY_ROLE_ID) {
                        const msg = await channel.send({
                            content: `<@&${NOTIFY_ROLE_ID}> 🚨 Server is **OFFLINE!**`
                        });

                        autoDelete(msg);
                    }
                }

                // 🟢 ONLINE ALERT
                if (lastData !== null && !lastData.online && data.online) {
                    console.log("🟢 Server back ONLINE");

                    if (NOTIFY_ROLE_ID) {
                        const msg = await channel.send({
                            content: `<@&${NOTIFY_ROLE_ID}> ✅ Server is back **ONLINE!**`
                        });

                        autoDelete(msg);
                    }
                }

                lastData = data;

                await statusMessage.edit({
                    embeds: [buildEmbed(data)]
                });
            }

        } catch (err) {
            console.log("❌ Update error:", err.message);
        }

        updaterTimeout = setTimeout(loop, 60000);
    }

    updaterTimeout = setTimeout(loop, 60000);
}

module.exports = { startUpdater, setMessage };