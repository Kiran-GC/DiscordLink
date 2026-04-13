const fetch = global.fetch || ((...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))
);

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

module.exports = { getStatus };