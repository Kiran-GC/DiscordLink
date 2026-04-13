console.log("TOKEN VALUE:", process.env.DISCORD_TOKEN);
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const mc = require('mc-server-util');

// ===== CONFIG =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // bot application ID
const GUILD_ID = process.env.GUILD_ID;   // your server ID
const CHANNEL_ID = process.env.CHANNEL_ID;

const MC_HOST = "play.adholokham.online";
const MC_PORT = 25588;

// ===== DISCORD CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== REGISTER SLASH COMMAND =====
const commands = [
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Start live MC server status panel')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// ===== VARIABLES =====
let statusMessage = null;

// ===== FUNCTION: GET STATUS =====
async function getStatus() {
    try {
        const res = await mc.status(MC_HOST, MC_PORT);

        const players = res.players.sample
            ? res.players.sample.map(p => p.name).join(", ")
            : "No players online";

        return {
            online: true,
            text:
                `🟢 **ONLINE**\n` +
                `👥 ${res.players.online}/${res.players.max}\n` +
                `📋 ${players}`
        };
    } catch {
        return {
            online: false,
            text: `🔴 **OFFLINE**`
        };
    }
}

// ===== FUNCTION: LOOP UPDATE =====
async function startUpdater(channel) {
    setInterval(async () => {
        if (!statusMessage) return;

        const status = await getStatus();

        await statusMessage.edit({
            content:
                `📡 **MC Server Status**\n\n${status.text}\n\n⏱ Updated: <t:${Math.floor(Date.now()/1000)}:R>`
        });

    }, 60000); // every 60 sec
}

// ===== READY =====
client.on('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // Register slash command (guild only = instant)
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );

    console.log("✅ Slash command registered");
});

// ===== HANDLE COMMAND =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'status') {
        const channel = await client.channels.fetch(CHANNEL_ID);

        const status = await getStatus();

        statusMessage = await channel.send({
            content:
                `📡 **MC Server Status**\n\n${status.text}\n\n⏱ Initializing...`
        });

        await interaction.reply({
            content: "✅ Status panel created!",
            ephemeral: true
        });

        startUpdater(channel);
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE (Render) =====
require('http').createServer((req, res) => {
    res.end("Bot alive");
}).listen(3000);