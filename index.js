// ===== IMPORTS =====
const { Client, GatewayIntentBits } = require('discord.js');
const { Client: WAClient, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ===== ENV VARIABLES =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;

// ===== DISCORD CLIENT =====
const discord = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===== WHATSAPP CLIENT =====
const wa = new WAClient({
    authStrategy: new LocalAuth()
});

// ===== WHATSAPP QR =====
wa.on('qr', qr => {
    console.log("Scan this QR with WhatsApp:");
    qrcode.generate(qr, { small: true });
});

// ===== WHATSAPP READY =====
wa.on('ready', () => {
    console.log("✅ WhatsApp is ready!");
});

// ===== DISCORD LISTENER =====
discord.on('messageCreate', async (message) => {
    try {
        // Ignore bots (VERY IMPORTANT)
        if (message.author.bot) return;

        // Only listen to your specific channel
        if (message.channel.id !== CHANNEL_ID) return;

        let content = message.content;

        // Handle embeds (common for plugins)
        if (!content && message.embeds.length > 0) {
            const embed = message.embeds[0];
            content = embed.description || embed.title || "MC Event";
        }

        if (!content) return;

        // Filter only important events
        const keywords = ["Started", "Stopping", "Restart"];
        const isRelevant = keywords.some(k => content.includes(k));

        if (!isRelevant) return;

        console.log("📩 Forwarding:", content);

        // Send to WhatsApp (DM or Group)
        await wa.sendMessage(
            WHATSAPP_NUMBER,
            `📡 MC Server Update:\n${content}`
        );

    } catch (err) {
        console.error("❌ Error:", err);
    }
});

// ===== LOGIN =====
discord.login(DISCORD_TOKEN);
wa.initialize();

// ===== KEEP-ALIVE SERVER (FOR RENDER) =====
require('http').createServer((req, res) => {
    res.end("Bot is alive");
}).listen(3000);