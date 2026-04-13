const { ActivityType } = require('discord.js');
const { getStatus } = require('../mc/status');
const { MC_HOST, MC_PORT } = require('../config/config');

async function dynamicPresence(client) {
    try {
        const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

        const activities = [
            { name: `${data.players}/${data.max} players online`, type: ActivityType.Watching },
            { name: data.online ? "Server Online" : "Server Offline", type: ActivityType.Watching },
            { name: `Forge ${data.version}`, type: ActivityType.Playing },
            { name: "play.gamerluttan.online", type: ActivityType.Playing }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setActivity(activity);

    } catch {}
}

module.exports = { dynamicPresence };