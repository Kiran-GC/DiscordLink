const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Routes, 
    REST,
    EmbedBuilder
} = require('discord.js');

const fetch = require('node-fetch');
const fs = require('fs');

// ===== ENV =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const MC_HOST = "play.gamerluttan.online";
const MC_PORT = 25588;

const SAVE_FILE = "panel.json";

// ===== CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== COMMAND =====
const commands = [
    new SlashCommandBuilder()
        .setName('serverstat')
        .setDescription('Create/reset MC status panel')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// ===== STATE =====
let statusMessage = null;
let updaterTimeout = null;
let lastData = null;
let commandRunning = false;

// ===== SAVE / LOAD =====
function savePanel(id) {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({ id }));
}

function loadPanel() {
    if (!fs.existsSync(SAVE_FILE)) return null;
    return JSON.parse(fs.readFileSync(SAVE_FILE)).id;
}

// ===== FETCH STATUS =====
async function getStatus() {
    try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${MC_HOST}:${MC_PORT}`, {
            cache: "no-store"
        });
        const data = await res.json();

        return {
            online: data.online || false,
            players: data.players?.online || 0,
            max: data.players?.max || 0,
            list: data.players?.list || [],
            version: data.version || "Unknown"
        };

    } catch {
        return {
            online: false,
            players: 0,
            max: 0,
            list: [],
            version: "Unknown"
        };
    }
}

// ===== EMBED =====
function buildEmbed(data) {
    return new EmbedBuilder()
        .setTitle("📡 MC Server Status")
        .setColor(data.online ? 0x00ff00 : 0xff0000)
        .addFields(
            { name: "Status", value: data.online ? "🟢 Online" : "🔴 Offline", inline: true },
            { name: "Players", value: `${data.players}/${data.max}`, inline: true },
            { name: "Version", value: data.version, inline: true },
            { name: "Player List", value: data.list.length ? data.list.join(", ") : "No players" }
        )
        .setTimestamp();
}

// ===== RELIABLE LOOP =====
function startUpdater(channel) {
    if (updaterTimeout) clearTimeout(updaterTimeout);

    async function loop() {
        console.log("⏱ Checking update...");

        if (!statusMessage) return;

        try {
            const data = await getStatus();

            if (
                !lastData ||
                data.online !== lastData.online ||
                data.players !== lastData.players ||
                data.max !== lastData.max
            ) {
                lastData = data;

                await statusMessage.edit({
                    embeds: [buildEmbed(data)]
                });

                console.log("✅ Updated");
            }

        } catch (err) {
            console.log("❌ Update error:", err.message);
        }

        updaterTimeout = setTimeout(loop, 60000);
    }

    loop();
}

// ===== READY =====
client.on('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );

    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    if (savedId) {
        try {
            statusMessage = await channel.messages.fetch(savedId);
            console.log("🔁 Restored panel");
            startUpdater(channel);
        } catch {
            console.log("⚠️ Panel not found");
        }
    }
});

// ===== COMMAND (FINAL FIXED FLOW) =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'serverstat') return;

    if (commandRunning) return;
    commandRunning = true;

    const channel = await client.channels.fetch(CHANNEL_ID);

    try {
        // 🔥 CREATE PANEL FIRST (NO DEPENDENCY ON DISCORD RESPONSE)
        const data = await getStatus();
        lastData = data;

        // delete old panel
        const savedId = loadPanel();
        if (savedId) {
            try {
                const oldMsg = await channel.messages.fetch(savedId);
                await oldMsg.delete();
            } catch {}
        }

        statusMessage = await channel.send({
            embeds: [buildEmbed(data)]
        });

        savePanel(statusMessage.id);

        // 🔥 START UPDATER GUARANTEED
        startUpdater(channel);

        // 🟡 OPTIONAL INTERACTION RESPONSE
        try {
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({
                content: "✅ Panel created/reset!"
            });
        } catch (err) {
            console.log("⚠️ Interaction failed (ignored):", err.message);
        }

    } catch (err) {
        console.log("❌ Critical command error:", err.message);
    }

    setTimeout(() => {
        commandRunning = false;
    }, 2000);
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE =====
require('http').createServer((req, res) => {
    res.end("Alive");
}).listen(3000);