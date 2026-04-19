const { MessageFlags } = require('discord.js');

function ephemeralReply(content) {
    return {
        content,
        flags: MessageFlags.Ephemeral
    };
}

function noPermissionReply() {
    return ephemeralReply('❌ You don’t have permission.');
}

function panelUpdatedReply() {
    return ephemeralReply('✅ Panel updated!');
}

function tutorialPanelUpdatedReply() {
    return ephemeralReply('✅ Tutorial panel updated.');
}

function activeEmbedSessionReply() {
    return ephemeralReply('⚠️ You already have an active embed session. Finish or cancel it first.');
}

function invalidFieldNumberReply() {
    return ephemeralReply('❌ Invalid field number.');
}

function invalidChannelReply() {
    return ephemeralReply('❌ Invalid channel.');
}

function embedSentReply() {
    return ephemeralReply('✅ Embed sent.');
}

function embedSessionExpiredReply() {
    return ephemeralReply('⚠️ Your embed session was deleted or expired. Start a new one with /embed.');
}

function tutorialSessionExpiredReply() {
    return ephemeralReply('⚠️ Your tutorial session expired. Reopen it from the Tutorials panel.');
}

module.exports = {
    ephemeralReply,
    noPermissionReply,
    panelUpdatedReply,
    tutorialPanelUpdatedReply,
    activeEmbedSessionReply,
    invalidFieldNumberReply,
    invalidChannelReply,
    embedSentReply,
    embedSessionExpiredReply,
    tutorialSessionExpiredReply
};