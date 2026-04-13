const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Routes, 
    REST,
    EmbedBuilder,
    ActivityType,
    AttachmentBuilder
} = require('discord.js');

const fetch = require('node-fetch');
const fs = require('fs');
const express = require('express');

// ===== ENV =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID;

const MC_HOST = "play.gamerluttan.online";
const MC_PORT = 25588;

const SAVE_FILE = "panel.json";

// ===== EXPRESS KEEP ALIVE =====
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

app.listen(3000, () => {
    console.log("🌐 Keep-alive server running");
});

// Optional internal ping (backup)
setInterval(() => {
    fetch(`http://localhost:3000`).catch(() => {});
}, 4 * 60 * 1000);

// ===== CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== COMMANDS =====
const commands = [
    new SlashCommandBuilder()
        .setName('serverstat')
        .setDescription('Create or update MC status panel'),

    new SlashCommandBuilder()
        .setName('mcsrv')
        .setDescription('Check any Minecraft server')
        .addStringOption(opt =>
            opt.setName('ip')
                .setDescription('Server IP (with optional port)')
                .setRequired(true)
        )
].map(c => c.toJSON());

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

// ===== PERMISSION =====
function hasAccess(interaction) {
    return interaction.member.roles.cache.has(ALLOWED_ROLE_ID);
}

// ===== FETCH STATUS =====
async function getStatus(ip) {
    try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${ip}`, {
            cache: "no-store"
        });
        const data = await res.json();

        return {
            online: data.online || false,
            players: data.players?.online || 0,
            max: data.players?.max || 0,
            list: data.players?.list || [],
            version: data.version || "Unknown",
            icon: data.icon || null
        };

    } catch {
        return {
            online: false,
            players: 0,
            max: 0,
            list: [],
            version: "Unknown",
            icon: null
        };
    }
}

// ===== MAIN EMBED =====
function buildEmbed(data) {
    const playerList = data.list.length
        ? data.list.slice(0, 10).map(p => `• ${p}`).join("\n") +
          (data.list.length > 10 ? `\n+ ${data.list.length - 10} more...` : "")
        : "No players online";

    return new EmbedBuilder()
        .setTitle("Adholokham MC (OmniCraft)")
        .setDescription("Forge-powered OmniCraft experience • Survival • Community-driven gameplay")
        .setColor(data.online ? 0x22c55e : 0xef4444)
        .setThumbnail("https://cdn.discordapp.com/attachments/786154341638864917/1492544844554305698/PNG.png")

        .addFields(
            { name: "📡 Status", value: `\`\`\`${data.online ? "🟢 Online" : "🔴 Offline"}\`\`\``, inline: true },
            { name: "👥 Players", value: `\`\`\`${data.players} / ${data.max}\`\`\``, inline: true },
            { name: "⚙️ Version", value: `\`\`\`${data.version}\`\`\``, inline: true },

            { name: "🌐 Primary IP", value: "```play.gamerluttan.online```", inline: false },
            { name: "🌐 Secondary IP", value: "```play.adholokham.online```", inline: false },

            { name: "👥 Players Online", value: `\`\`\`\n${playerList}\n\`\`\``, inline: false }
        )

        .setFooter({ text: "Watcher v1 • Live Status" })
        .setTimestamp();
}

// ===== SIMPLE EMBED =====
function buildSimpleEmbed(data, ip) {
    const playerList = data.list.length
        ? data.list.slice(0, 10).map(p => `• ${p}`).join("\n") +
          (data.list.length > 10 ? `\n+ ${data.list.length - 10} more...` : "")
        : "No players online";

    return new EmbedBuilder()
        .setTitle(`Server Check: ${ip}`)
        .setColor(data.online ? 0x22c55e : 0xef4444)

        .addFields(
            { name: "📡 Status", value: `\`\`\`${data.online ? "🟢 Online" : "🔴 Offline"}\`\`\``, inline: true },
            { name: "👥 Players", value: `\`\`\`${data.players} / ${data.max}\`\`\``, inline: true },
            { name: "⚙️ Version", value: `\`\`\`${data.version}\`\`\``, inline: true },
            { name: "👥 Players Online", value: `\`\`\`\n${playerList}\n\`\`\``, inline: false }
        )

        .setFooter({ text: "Watcher v1 • Quick Check" })
        .setTimestamp();
}

// ===== DYNAMIC PRESENCE =====
async function dynamicPresence() {
    try {
        const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

        const activities = [
            { name: `${data.players}/${data.max} players online`, type: ActivityType.Watching },
            { name: data.online ? "Server Online" : "Server Offline", type: ActivityType.Watching },
            { name: `Forge ${data.version}`, type: ActivityType.Playing },
            { name: "play.gamerluttan.online", type: ActivityType.Playing }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setActivity(activity);

    } catch (err) {
        console.log("Presence error:", err.message);
    }
}

setInterval(dynamicPresence, 20000);

// ===== UPDATER =====
function startUpdater(channel) {
    if (updaterTimeout) return;

    async function loop() {
        console.log("⏱ Checking update...");

        if (!statusMessage) return;

        try {
            const data = await getStatus(`${MC_HOST}:${MC_PORT}`);

            if (
                !lastData ||
                data.players !== lastData.players ||
                data.online !== lastData.online ||
                data.max !== lastData.max
            ) {
                lastData = data;
                await statusMessage.edit({ embeds: [buildEmbed(data)] });
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

    dynamicPresence();

    const channel = await client.channels.fetch(CHANNEL_ID);
    const savedId = loadPanel();

    let restored = false;

    if (savedId) {
        try {
            const msg = await channel.messages.fetch(savedId);
            statusMessage = msg;
            restored = true;
        } catch {}
    }

    if (!restored) {
        const messages = await channel.messages.fetch({ limit: 50 });

        const panel = messages.find(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0]?.title?.includes("Adholokham MC")
        );

        if (panel) {
            statusMessage = panel;
            savePanel(panel.id);
        }
    }

    if (statusMessage) startUpdater(channel);
});

// ===== COMMAND HANDLER =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (!hasAccess(interaction)) {
        return interaction.reply({
            content: "❌ You don’t have permission.",
            ephemeral: true
        });
    }

    const channel = await client.channels.fetch(CHANNEL_ID);

    try {
        if (interaction.commandName === 'serverstat') {

            const data = await getStatus(`${MC_HOST}:${MC_PORT}`);
            lastData = data;

            let msg;
            const savedId = loadPanel();

            if (savedId) {
                try {
                    msg = await channel.messages.fetch(savedId);
                } catch {}
            }

            if (msg) {
                await msg.edit({ embeds: [buildEmbed(data)] });
            } else {
                msg = await channel.send({ embeds: [buildEmbed(data)] });
                savePanel(msg.id);
            }

            statusMessage = msg;
            startUpdater(channel);

            return interaction.reply({ content: "✅ Panel updated!", ephemeral: true });
        }

        if (interaction.commandName === 'mcsrv') {

            const ip = interaction.options.getString('ip');
            const data = await getStatus(ip);

            const embed = buildSimpleEmbed(data, ip);
            let files = [];

            if (data.icon && data.icon.startsWith("data:image")) {
                const base64 = data.icon.split(",")[1];
                const buffer = Buffer.from(base64, "base64");

                const attachment = new AttachmentBuilder(buffer, { name: "icon.png" });
                files.push(attachment);

                embed.setThumbnail("attachment://icon.png");
            } else if (data.icon) {
                embed.setThumbnail(data.icon);
            }

            return interaction.reply({
                embeds: [embed],
                files
            });
        }

    } catch (err) {
        console.log(err);
    }
});

// ===== START =====
client.login(DISCORD_TOKEN);