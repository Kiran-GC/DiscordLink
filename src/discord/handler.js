const { commandMap } = require('./commands');
const {
    botMissingPermissionsReply,
    unknownCommandReply,
    ephemeralReply
} = require('../utils/interactionReplies');
const { isMissingPermissionsError } = require('../utils/discordErrors');
const { VERIFY_CHANNEL_ID } = require('../config/config');

async function handleInteraction(client, interaction) {
    try {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        // 🔒 VERIFY CHANNEL COMMAND LOCK
        if (
            interaction.channelId === VERIFY_CHANNEL_ID &&
            interaction.commandName !== 'verify'
        ) {
            return interaction.reply(
                ephemeralReply('❌ Only `/verify` is allowed in this channel.')
            );
        }

        const handler = commandMap.get(interaction.commandName);
        if (!handler) {
            return interaction.reply(unknownCommandReply());
        }

        return handler(client, interaction);

    } catch (error) {
        console.log(
            `❌ Command error [/${interaction.commandName}] user=${interaction.user?.id ?? 'unknown'} guild=${interaction.guildId ?? 'dm'}:`,
            error
        );

        if (isMissingPermissionsError(error) && !interaction.replied && !interaction.deferred) {
            return interaction.reply(botMissingPermissionsReply());
        }

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply(
                ephemeralReply('❌ Something went wrong while running that command.')
            );
        }
    }
}

module.exports = { handleInteraction };