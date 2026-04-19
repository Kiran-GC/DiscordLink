const { getStatus } = require('../mc/status');
const { buildEmbed } = require('../embeds/mainEmbed');
const { MC_HOST, MC_PORT, NOTIFY_ROLE_ID } = require('../config/config');
const { clearPanel } = require('../utils/storage');
const { isMissingPermissionsError, isUnknownMessageError } = require('../utils/discordErrors');

let updaterTimeout = null;
let lastData = null;
let statusMessage = null;

function setMessage(msg) {
    statusMessage = msg;
}

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
                if (lastData !== null && lastData.online && !data.online) {
                    console.log('🚨 Server went OFFLINE');

                    if (NOTIFY_ROLE_ID) {
                        try {
                            const message = await channel.send({
                                content: `<@&${NOTIFY_ROLE_ID}> 🚨 Server is **OFFLINE!**`
                            });

                            autoDelete(message);
                        } catch (error) {
                            if (isMissingPermissionsError(error)) {
                                console.log('⚠️ Missing permissions while sending the offline alert.');
                            } else {
                                throw error;
                            }
                        }
                    }
                }

                if (lastData !== null && !lastData.online && data.online) {
                    console.log('🟢 Server back ONLINE');

                    if (NOTIFY_ROLE_ID) {
                        try {
                            const message = await channel.send({
                                content: `<@&${NOTIFY_ROLE_ID}> ✅ Server is back **ONLINE!**`
                            });

                            autoDelete(message);
                        } catch (error) {
                            if (isMissingPermissionsError(error)) {
                                console.log('⚠️ Missing permissions while sending the online alert.');
                            } else {
                                throw error;
                            }
                        }
                    }
                }

                lastData = data;

                try {
                    await statusMessage.edit({ embeds: [buildEmbed(data)] });
                } catch (error) {
                    if (isUnknownMessageError(error)) {
                        console.log('⚠️ Status panel was deleted. Clearing saved panel state.');
                        clearPanel();
                        statusMessage = null;
                    } else if (isMissingPermissionsError(error)) {
                        console.log('⚠️ Missing permissions while updating the status panel.');
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.log('❌ Update error:', error.message);
        }

        updaterTimeout = setTimeout(loop, 60000);
    }

    updaterTimeout = setTimeout(loop, 60000);
}

module.exports = { startUpdater, setMessage };