const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Routes, 
    REST 
} = require('discord.js');

const fetch = require('node-fetch');

// ===== ENV VARIABLES =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

// ===== MC SERVER CONFIG =====
const MC_HOST = "play.gamerluttan.online";
const MC_PORT = 25588;

// ===== DISCORD CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMAND =====
const commands = [
    new SlashCommandBuilder()
        .setName('serverstat')
        .setDescription('Start live MC server status panel')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// ===== GLOBAL STATE =====
let statusMessage = null;
let updaterInterval = null;

// ===== GET MC STATUS =====
async function getStatus() {
    try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${MC_HOST}:${MC_PORT}`);
        const data = await res.json();

        if (!data.online) {
            return { text: `🔴 **OFFLINE**` };
        }

        const players = data.players && data.players.list
            ? data.players.list.join(", ")
            : "No players online";

        return {
            text:
                `🟢 **ONLINE**\n` +
                `👥 ${data.players.online}/${data.players.max}\n` +
                `📋 ${players}`
        };

    } catch {
        return { text: `🔴 **OFFLINE**` };
    }
}

// ===== UPDATE LOOP =====
function startUpdater() {
    if (updaterInterval) clearInterval(updaterInterval);

    updaterInterval = setInterval(async () => {
        if (!statusMessage) return;

        const status = await getStatus();
        const timestamp = Math.floor(Date.now() / 1000);

        try {
            await statusMessage.edit({
                content:
                    `📡 **MC Server Status**\n\n` +
                    `${status.text}\n\n` +
                    `⏱ Updated: <t:${timestamp}:F>`
            });
        } catch (err) {
            console.log("⚠️ Message missing, stopping updater");

            statusMessage = null;
            clearInterval(updaterInterval);
        }

    }, 60000);
}

// ===== READY =====
client.on('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );

    console.log("✅ /serverstat registered");
});

// ===== COMMAND =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'serverstat') {

        const channel = await client.channels.fetch(CHANNEL_ID);

        // 🔥 DELETE OLD MESSAGE IF EXISTS
        if (statusMessage) {
            try {
                await statusMessage.delete();
            } catch {
                // ignore if already deleted
            }
        }

        const status = await getStatus();
        const timestamp = Math.floor(Date.now() / 1000);

        statusMessage = await channel.send({
            content:
                `📡 **MC Server Status**\n\n` +
                `${status.text}\n\n` +
                `⏱ Updated: <t:${timestamp}:F>`
        });

        await interaction.reply({
            content: "✅ Status panel reset!",
            ephemeral: true
        });

        startUpdater();
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE (Render) =====
require('http').createServer((req, res) => {
    res.end("Bot is alive");
}).listen(3000);