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
        const res = await fetch(`https://api.mcsrvstat.us/2/${MC_HOST}:${MC_PORT}`, {
            cache: "no-store"
        });

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

    } catch (err) {
        console.log("API error:", err.message);
        return { text: `🔴 **OFFLINE**` };
    }
}

// ===== UPDATE LOOP (FIXED) =====
function startUpdater() {
    if (updaterInterval) clearInterval(updaterInterval);

    updaterInterval = setInterval(async () => {
        console.log("⏱ Running update...");

        if (!statusMessage) {
            console.log("⚠️ No message set");
            return;
        }

        try {
            const status = await getStatus();
            const timestamp = Math.floor(Date.now() / 1000);

            await statusMessage.edit({
                content:
                    `📡 **MC Server Status**\n\n` +
                    `${status.text}\n\n` +
                    `⏱ Updated: <t:${timestamp}:F>`
            });

            console.log("✅ Updated successfully");

        } catch (err) {
            console.log("❌ Update failed:", err.message);
        }

    }, 60000); // 1 minute
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

        // 🔥 DELETE PREVIOUS BOT MESSAGE (avoid duplicates)
        const messages = await channel.messages.fetch({ limit: 10 });

        const botMsg = messages.find(msg =>
            msg.author.id === client.user.id &&
            msg.content.includes("MC Server Status")
        );

        if (botMsg) {
            try { await botMsg.delete(); } catch {}
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
            content: "✅ Status panel created/reset!",
            ephemeral: true
        });

        startUpdater();
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE =====
require('http').createServer((req, res) => {
    res.end("Bot is alive");
}).listen(3000);