const { commandMap } = require('./commands');
const {
    botMissingPermissionsReply,
    unknownCommandReply
} = require('../utils/interactionReplies');
const { isMissingPermissionsError } = require('../utils/discordErrors');

async function handleInteraction(client, interaction) {
    try {
        if (!interaction.isChatInputCommand()) {
            return;
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
            return interaction.reply({
                content: '❌ Something went wrong while running that command.',
                flags: botMissingPermissionsReply().flags
            });
        }
    }
}

module.exports = { handleInteraction };