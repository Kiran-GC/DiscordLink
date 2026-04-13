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
let updaterInterval = null;
let lastData = null;

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

        if (!data.online) {
            return {
                online: false,
                players: 0,
                max: 0,
                list: [],
                version: "Unknown"
            };
        }

        return {
            online: true,
            players: data.players.online,
            max: data.players.max,
            list: data.players.list || [],
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

// ===== BUILD EMBED =====
function buildEmbed(data) {
    return new EmbedBuilder()
        .setTitle("📡 MC Server Status")
        .setColor(data.online ? 0x00ff00 : 0xff0000)
        .addFields(
            { name: "Status", value: data.online ? "🟢 Online" : "🔴 Offline", inline: true },
            { name: "Players", value: `${data.players}/${data.max}`, inline: true },
            { name: "Version", value: data.version, inline: true },
            { name: "Player List", value: data.list.length ? data.list.join(", ") : "No players", inline: false }
        )
        .setFooter({ text: "Last updated" })
        .setTimestamp();
}

// ===== UPDATE LOOP =====
function startUpdater(channel) {
    if (updaterInterval) clearInterval(updaterInterval);

    updaterInterval = setInterval(async () => {
        console.log("⏱ Checking update...");

        if (!statusMessage) return;

        const data = await getStatus();

        console.log("Players:", data.players);

        // ✅ SMART CHECK (fixed)
        if (
            lastData &&
            data.online === lastData.online &&
            data.players === lastData.players &&
            data.max === lastData.max
        ) {
            return;
        }

        lastData = data;

        try {
            await statusMessage.edit({
                embeds: [buildEmbed(data)]
            });

            console.log("✅ Updated");

        } catch (err) {
            console.log("❌ Message lost, stopping updater");
            clearInterval(updaterInterval);
            statusMessage = null;
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

    console.log("✅ Command registered");

    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    if (savedId) {
        try {
            statusMessage = await channel.messages.fetch(savedId);
            console.log("🔁 Restored panel");
            startUpdater(channel);
        } catch {
            console.log("⚠️ Saved panel not found");
        }
    }
});

// ===== COMMAND =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'serverstat') {

        const channel = await client.channels.fetch(CHANNEL_ID);

        // ✅ DELETE ONLY SAVED PANEL
        const savedId = loadPanel();

        if (savedId) {
            try {
                const oldMsg = await channel.messages.fetch(savedId);
                await oldMsg.delete();
            } catch {}
        }

        const data = await getStatus();
        lastData = data;

        statusMessage = await channel.send({
            embeds: [buildEmbed(data)]
        });

        savePanel(statusMessage.id);

        await interaction.reply({
            content: "✅ Panel created/reset!",
            ephemeral: true
        });

        startUpdater(channel);
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE =====
require('http').createServer((req, res) => {
    res.end("Bot alive");
}).listen(3000);