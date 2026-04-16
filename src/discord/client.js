const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, CHANNEL_ID } = require('../config/config');
const { commands } = require('./commands');
const { handleInteraction } = require('./handler');
const { dynamicPresence } = require('../systems/presence');
const { loadPanel, savePanel } = require('../utils/storage');
const { setMessage, startUpdater } = require('../systems/updater');

// Tutorials
const { upsertPanel } = require('../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../systems/tutorials/config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// ===== READY =====
client.once('clientReady', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands.map(c => c.toJSON()) }
    );

    // ===== PRESENCE =====
    setInterval(() => dynamicPresence(client), 20000);
    dynamicPresence(client);

    // ===== MC PANEL RESTORE =====
    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    let restored = false;

    if (savedId) {
        try {
            const msg = await channel.messages.fetch(savedId);
            setMessage(msg);
            startUpdater(channel);
            console.log("✅ Panel restored from saved ID");
            restored = true;
        } catch {
            console.log("⚠️ Failed to fetch saved panel, trying fallback...");
        }
    }

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
                savePanel(panel.id);
                console.log("✅ Panel restored via scan");
                restored = true;
            }
        } catch (err) {
            console.log("❌ Panel scan failed:", err.message);
        }
    }

    if (!restored) {
        console.log("⚠️ No panel found. Use /serverstat to create one.");
    }

    // ===== TUTORIAL PANEL =====
    try {
        const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
        await upsertPanel(client, tutorialChannel);
        console.log("♻️ Tutorial panel updated");
    } catch (err) {
        console.log("❌ Tutorial panel error:", err.message);
    }
});

// ===== SINGLE ENTRY POINT =====
client.on('interactionCreate', async (interaction) => {
    await handleInteraction(client, interaction);
});

// ===== ERROR SAFETY =====
client.on('error', (err) => {
    console.error("❌ Client error:", err);
});

process.on('unhandledRejection', (err) => {
    console.error("❌ Unhandled rejection:", err);
});

client.login(DISCORD_TOKEN);