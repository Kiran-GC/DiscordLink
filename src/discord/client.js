const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, CHANNEL_ID } = require('../config/config');
const { commands } = require('./commands');
const { handleInteraction } = require('./handler');
const { dynamicPresence } = require('../systems/presence');
const { loadPanel, savePanel } = require('../utils/storage');
const { setMessage, startUpdater } = require('../systems/updater');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands.map(c => c.toJSON()) }
    );

    // Presence
    setInterval(() => dynamicPresence(client), 20000);
    dynamicPresence(client);

    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    let restored = false;

    // ===== 1. Try restore from saved ID =====
    if (savedId) {
        try {
            const msg = await channel.messages.fetch(savedId);
            setMessage(msg);
            startUpdater(channel);
            console.log("✅ Panel restored from saved ID");
            restored = true;
        } catch (err) {
            console.log("⚠️ Failed to fetch saved panel, trying fallback...");
        }
    }

    // ===== 2. Fallback: scan channel =====
    if (!restored) {
        try {
            const messages = await channel.messages.fetch({ limit: 50 });

            const panel = messages.find(msg =>
                msg.author.id === client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0]?.title?.includes("Adholokham MC")
            );

            if (panel) {
                setMessage(panel);
                startUpdater(channel);
                console.log("✅ Panel restored via channel scan");

                // Re-save panel ID (important for Render resets)
                savePanel(panel.id);

                restored = true;
            }
        } catch (err) {
            console.log("❌ Fallback scan failed:", err.message);
        }
    }

    // ===== 3. Final fallback =====
    if (!restored) {
        console.log("⚠️ No existing panel found. Use /serverstat to create one.");
    }
});

client.on('interactionCreate', i => handleInteraction(client, i));

client.login(DISCORD_TOKEN);