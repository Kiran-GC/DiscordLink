const sessions = new Map();

function clearSession(userId) {
    const session = sessions.get(userId);
    if (session?.timeout) clearTimeout(session.timeout);
    sessions.delete(userId);
}

function getSession(userId) {
    return sessions.get(userId) || null;
}

function setSession(userId, session) {
    sessions.set(userId, session);
    return session;
}

async function fetchSessionMessage(client, session) {
    const channel = await client.channels.fetch(session.channelId);
    return channel.messages.fetch(session.messageId);
}

async function getActiveSession(client, userId) {
    const session = getSession(userId);
    if (!session) return null;

    try {
        await fetchSessionMessage(client, session);
        return session;
    } catch {
        clearSession(userId);
        return null;
    }
}

module.exports = {
    clearSession,
    getSession,
    setSession,
    fetchSessionMessage,
    getActiveSession
};