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

function botMissingPermissionsReply() {
    return ephemeralReply('⚠️ I’m missing Discord permissions to complete that action.');
}

function unknownCommandReply() {
    return ephemeralReply('⚠️ That command is not available right now.');
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

function invalidHexColorReply() {
    return ephemeralReply('❌ Invalid hex color. Use a 6-digit value like #22c55e.');
}

function invalidUrlReply() {
    return ephemeralReply('❌ Invalid URL. Use a full http or https link.');
}

function commandCooldownReply(seconds) {
    return ephemeralReply(`⏳ Please wait ${seconds}s before using that command again.`);
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
    botMissingPermissionsReply,
    unknownCommandReply,
    panelUpdatedReply,
    tutorialPanelUpdatedReply,
    activeEmbedSessionReply,
    invalidFieldNumberReply,
    invalidChannelReply,
    invalidHexColorReply,
    invalidUrlReply,
    commandCooldownReply,
    embedSentReply,
    embedSessionExpiredReply,
    tutorialSessionExpiredReply
};