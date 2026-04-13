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
        .setDescription('Create or update MC status panel')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// ===== STATE =====
let statusMessage = null;
let updaterTimeout = null;
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

// ===== EMBED (NEW DESIGN) =====
function buildEmbed(data) {
    const uptime = "Unknown";

    const playerList = data.list.length
        ? data.list.map(p => `• ${p}`).join("\n")
        : "No players online";

    return new EmbedBuilder()
        .setTitle("Adholokham MC (OmniCraft)")
        .setDescription("The ultimate Minecraft experience where your story begins.")
        .setColor(data.online ? 0x00ff88 : 0xff3b3b)

        .setThumbnail("https://cdn.discordapp.com/attachments/786154341638864917/1492544844554305698/PNG.png")

        .addFields(
            {
                name: "┃ STATUS",
                value: `\`\`\`${data.online ? "🟢 Online" : "🔴 Offline"}\`\`\``,
                inline: true
            },
            {
                name: "┃ PLAYERS",
                value: `\`\`\`${data.players}/${data.max}\`\`\``,
                inline: true
            },
            {
                name: "┃ UPTIME",
                value: `\`\`\`${uptime}\`\`\``,
                inline: true
            },
            {
                name: "┃ IP",
                value:
`\`\`\`
play.gamerluttan.online
play.adholokham.online
\`\`\``,
                inline: true
            },
            {
                name: "┃ PLAYER LIST",
                value: `\`\`\`\n${playerList}\n\`\`\``,
                inline: false
            }
        )

        .setFooter({
            text: "Watcher v1 • Updated every minute"
        })
        .setTimestamp();
}

// ===== UPDATER LOOP =====
function startUpdater(channel) {
    if (updaterTimeout) return;

    async function loop() {
        console.log("⏱ Checking update...");

        if (!statusMessage) {
            updaterTimeout = null;
            return;
        }

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

    updaterTimeout = setTimeout(loop, 60000);
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

// ===== COMMAND =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'serverstat') return;

    const channel = await client.channels.fetch(CHANNEL_ID);

    try {
        const data = await getStatus();
        lastData = data;

        let msg = null;
        const savedId = loadPanel();

        if (savedId) {
            try {
                msg = await channel.messages.fetch(savedId);
            } catch {
                msg = null;
            }
        }

        if (msg) {
            await msg.edit({
                embeds: [buildEmbed(data)]
            });

            statusMessage = msg;
            console.log("♻️ Reused panel");

        } else {
            msg = await channel.send({
                embeds: [buildEmbed(data)]
            });

            statusMessage = msg;
            savePanel(msg.id);

            console.log("🆕 Created panel");
        }

        startUpdater(channel);

        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "✅ Panel updated!",
                    flags: 64
                });
            }
        } catch {}

    } catch (err) {
        console.log("❌ Command error:", err.message);
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);

// ===== KEEP ALIVE =====
require('http').createServer((req, res) => {
    res.end("Alive");
}).listen(3000);