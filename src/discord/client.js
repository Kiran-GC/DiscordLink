const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { validateConfig } = require('../config/validate');
const {
    DISCORD_TOKEN,
    CLIENT_ID,
    GUILD_ID,
    CHANNEL_ID
} = validateConfig();
const { commands } = require('./commands');
const { handleInteraction } = require('./handler');
const { dynamicPresence } = require('../systems/presence');
const { loadPanel, savePanel, clearPanel } = require('../utils/storage');
const { isMissingPermissionsError, isUnknownMessageError } = require('../utils/discordErrors');
const { setMessage, startUpdater } = require('../systems/updater');
const { initVerifyGuard } = require('../systems/verifyGuard');

// Tutorials
const { handleTutorials, upsertPanel } = require('../systems/tutorials/tutorials');
const { TUTORIAL_CHANNEL_ID } = require('../systems/tutorials/config');

// Embed Builder
const { handleBuilder } = require('../systems/embedBuilder/builder');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    initVerifyGuard(client);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands.map(command => command.toJSON()) }
    );

    // Presence
    setInterval(() => dynamicPresence(client), 20000);
    dynamicPresence(client);

    // ===== MC PANEL RESTORE =====
    let channel;

    try {
        channel = await client.channels.fetch(CHANNEL_ID);
    } catch (error) {
        console.log('❌ Failed to fetch status channel during startup:', error.message);
        return;
    }

    const savedId = loadPanel();
    let restored = false;

    if (savedId) {
        try {
            const message = await channel.messages.fetch(savedId);
            setMessage(message);
            startUpdater(channel);
            console.log('✅ Panel restored from saved ID');
            restored = true;
        } catch (error) {
            if (isUnknownMessageError(error)) {
                clearPanel();
                console.log('⚠️ Saved panel no longer exists, clearing stale panel ID.');
            } else if (isMissingPermissionsError(error)) {
                console.log('⚠️ Missing permissions while restoring the saved status panel.');
            } else {
                console.log('⚠️ Failed to fetch saved panel, trying fallback...');
            }
        }
    }

    if (!restored) {
        try {
            const messages = await channel.messages.fetch({ limit: 50 });

            const panel = messages.find(message =>
                message.author.id === client.user.id &&
                message.embeds.length > 0 &&
                message.embeds[0]?.title?.includes('Adholokham MC')
            );

            if (panel) {
                setMessage(panel);
                startUpdater(channel);
                savePanel(panel.id);
                console.log('✅ Panel restored via scan');
                restored = true;
            }
        } catch (error) {
            if (isMissingPermissionsError(error)) {
                console.log('⚠️ Missing permissions while scanning for the status panel.');
            } else {
                console.log('❌ Panel scan failed:', error.message);
            }
        }
    }

    if (!restored) {
        console.log('⚠️ No panel found. Use /serverstat to create one.');
    }

    // ===== TUTORIAL PANEL UPSERT =====
    try {
        const tutorialChannel = await client.channels.fetch(TUTORIAL_CHANNEL_ID);
        await upsertPanel(client, tutorialChannel);
    } catch (error) {
        if (isMissingPermissionsError(error)) {
            console.log('⚠️ Missing permissions while refreshing the tutorial panel.');
        } else {
            console.log('❌ Tutorial panel error:', error.message);
        }
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            return handleInteraction(client, interaction);
        }

        if (interaction.isStringSelectMenu() || interaction.isButton()) {
            const handled = await handleTutorials(interaction, client);
            if (handled) return;
        }

        if (interaction.isButton() || interaction.isModalSubmit()) {
            return handleBuilder(interaction);
        }
    } catch (error) {
        const target = interaction.commandName || interaction.customId || 'unknown';
        console.log(
            `❌ Interaction error [${target}] user=${interaction.user?.id ?? 'unknown'} guild=${interaction.guildId ?? 'dm'}:`,
            error
        );
    }
});

client.login(DISCORD_TOKEN);