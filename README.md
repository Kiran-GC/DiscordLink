# 🤖 DiscordLink Bot

A modular Discord bot designed for Minecraft server communities, featuring live server status panels, tutorial systems, embed builder UI, and controlled verification workflows.

---

## 🚀 Features

### 📊 Server Status Panel

* Displays live Minecraft server status
* Auto-updates using a background updater system
* Restores panel after bot restarts

---

### 📚 Tutorial System

* Multi-page tutorial embeds with navigation
* Supports video links and structured guides
* Includes:

  * 🔐 Verification guide
  * 📦 Modpack installation guide

---

### 🎨 Embed Builder

* Interactive embed creation using buttons + modals
* Session-based system with:

  * Timeout handling
  * Single active session per user
* Supports:

  * Fields
  * Media (thumbnail, image)
  * Author/footer
  * Code block formatting

---

### 🔐 Permission System

* Role-based access control using `hasAccess()`
* Restricts sensitive commands:

  * `/embed`
  * `/tutorials`
  * `/serverstat`

---

### 🧠 Verify Channel Control

* Dedicated verification channel lock
* Only `/verify` command allowed (handled externally)
* All user messages auto-deleted
* Prevents misuse of other slash commands

---

### ⚡ Utility Commands

* `/ping` → check bot + API latency

---

## 🧱 Architecture

```
src/
├── discord/
│   ├── client.js         # Entry point (events, startup, routing)
│   ├── handler.js        # Slash command router
│   ├── commands.js       # Command definitions
│
├── systems/
│   ├── embedBuilder/     # Interactive embed builder
│   ├── tutorials/        # Tutorial panel system
│   ├── updater.js        # Server panel updater
│   ├── presence.js       # Dynamic bot presence
│   ├── verifyGuard.js    # Verify channel protection
│
├── utils/
│   ├── permissions.js
│   ├── storage.js
│   ├── discordErrors.js
│   ├── interactionReplies.js
│
├── config/
│   ├── config.js
│   ├── validate.js
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

---

### 2. Configure environment

Set the following in your environment:

```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
CHANNEL_ID=status_channel_id
```

---

### 3. Start the bot

```bash
node src/discord/client.js
```

---

## 🧪 Commands

| Command       | Description                |
| ------------- | -------------------------- |
| `/serverstat` | Create/update server panel |
| `/mcsrv`      | Check any Minecraft server |
| `/tutorials`  | Refresh tutorial panel     |
| `/embed`      | Open embed builder         |
| `/ping`       | Check latency              |

---

## 🔐 Verify Channel Behavior

Configured via:

```js
VERIFY_CHANNEL_ID
```

Behavior:

* ❌ All messages are deleted instantly
* ❌ All slash commands blocked except `/verify`
* ✅ `/verify` allowed (external bot)
* ✅ Bot embeds remain permanent

---

## ⚠️ Known Limitations

* Sessions stored in memory (reset on restart)
* No global cooldown system
* No persistent database yet
* Logging system not implemented

---

## 🧾 Future Improvements

* 🌐 Web dashboard (planned)
* 💾 Embed templates
* 📊 Logging & analytics
* 🔁 Persistent session storage (DB)
* 🔐 Role-based dashboard auth

---

## 🧠 Notes

This bot is built with a modular, system-based architecture to ensure:

* scalability
* maintainability
* clear separation of concerns

---

## 👤 Author

Developed and maintained by **Kiran Kumar K**

---

## 📜 License

MIT License
