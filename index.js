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
const MC_HOST = "play.gamerluttan.online"; // your domain
const MC_PORT = 25588; // your port

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

// ===== GET MC STATUS (API METHOD) =====
async function getStatus() {
    try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${MC_HOST}:${MC_PORT}`);
        const data = await res.json();

        if (!data.online) {
            return {
                online: false,
                text: `🔴 **OFFLINE**`
            };
        }

        const players = data.players && data.players.list
            ? data.players.list.join(", ")
            : "No players online";

        return {
            online: true,
            text:
                `🟢 **ONLINE**\n` +
                `👥 ${data.players.online}/${data.players.max}\n` +
                `📋 ${players}`
        };

    } catch (err) {
        console.error("API error:", err.message);

        return {
            online: false,
            text: `🔴 **OFFLINE**`
        };
    }
}

// ===== UPDATE LOOP =====
function startUpdater() {
    setInterval(async () => {
        if (!statusMessage) return;

        const status = await getStatus();

        await statusMessage.edit({
            content:
                `📡 **MC Server Status**\n\n` +
                `${status.text}\n\n` +
                `⏱ Updated: <t:${Math.floor(Date.now()/1000)}:R>`
        });

    }, 60000); // every 60 sec
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

// ===== COMMAND HANDLER =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'serverstat') {
        const channel = await client.channels.fetch(CHANNEL_ID);

        const status = await getStatus();

        statusMessage = await channel.send({
            content:
                `📡 **MC Server Status**\n\n` +
                `${status.text}\n\n` +
                `⏱ Initializing...`
        });

        await interaction.reply({
            content: "✅ Status panel created!",
            ephemeral: true
        });

        startUpdater();
    }
});

// ===== START BOT =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE (Render) =====
require('http').createServer((req, res) => {
    res.end("Bot is alive");
}).listen(3000);