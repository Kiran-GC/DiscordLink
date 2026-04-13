const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = require('../config/config');
const { commands } = require('./commands');
const { handleInteraction } = require('./handler');
const { dynamicPresence } = require('../systems/presence');
const { loadPanel } = require('../utils/storage');
const { setMessage, startUpdater } = require('../systems/updater');
const { CHANNEL_ID } = require('../config/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands.map(c => c.toJSON())
    });

    setInterval(() => dynamicPresence(client), 20000);

    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    if (savedId) {
        try {
            const msg = await channel.messages.fetch(savedId);
            setMessage(msg);
            startUpdater(channel);
        } catch {}
    }
});

client.on('interactionCreate', i => handleInteraction(client, i));

client.login(DISCORD_TOKEN);