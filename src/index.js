const connectDB = require('./services/database');
const startClient = require('./discord/client');

async function start() {
    await connectDB();           // ✅ Step 1: connect DB
    require('./web/server');     // ✅ Step 2: start web server
    await startClient();         // ✅ Step 3: start Discord bot
}

start();