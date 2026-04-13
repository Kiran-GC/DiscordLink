const express = require('express');

const fetch = global.fetch || ((...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))
);

const app = express();

app.get("/", (req, res) => res.send("Bot is alive"));

app.listen(3000, () => console.log("🌐 Keep-alive running"));

setInterval(() => {
    fetch("http://localhost:3000").catch(() => {});
}, 4 * 60 * 1000);