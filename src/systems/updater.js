const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { MC_HOST, MC_PORT, NOTIFY_ROLE_ID } = require('../config/config');

let updaterTimeout = null;
let lastData = null;
let statusMessage = null;

function setMessage(msg) {
    statusMessage = msg;
}

function startUpdater(channel) {
    if (updaterTimeout) clearTimeout(updaterTimeout);

    async function loop() {
        if (!statusMessage) {
            updaterTimeout = setTimeout(loop, 60000);
            return;
        }

        const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

        if (
            !lastData ||
            data.players !== lastData.players ||
            data.online !== lastData.online ||
            data.max !== lastData.max
        ) {

            if (lastData !== null && lastData.online && !data.online) {
                if (NOTIFY_ROLE_ID) {
                    channel.send({ content: `<@&${NOTIFY_ROLE_ID}> 🚨 Server is OFFLINE!` });
                }
            }

            if (lastData !== null && !lastData.online && data.online) {
                if (NOTIFY_ROLE_ID) {
                    channel.send({ content: `<@&${NOTIFY_ROLE_ID}> ✅ Server is back ONLINE!` });
                }
            }

            lastData = data;
            await statusMessage.edit({ embeds: [buildEmbed(data)] });
        }

        updaterTimeout = setTimeout(loop, 60000);
    }

    updaterTimeout = setTimeout(loop, 60000);
}

module.exports = { startUpdater, setMessage };