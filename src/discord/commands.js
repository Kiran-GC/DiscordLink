const serverstat = require('./commandModules/serverstat');
const mcsrv = require('./commandModules/mcsrv');
const ip = require('./commandModules/ip');
const serverinfo = require('./commandModules/serverinfo');
const tutorials = require('./commandModules/tutorials');
const embed = require('./commandModules/embed');
const ping = require('./commandModules/ping');

const commandModules = [
    serverstat,
    mcsrv,
    ip,
    serverinfo,
    tutorials,
    embed,
    ping
];

const commands = commandModules.map(command => command.data);
const commandMap = new Map(
    commandModules.map(command => [command.data.toJSON().name, command.execute])
);

module.exports = { commands, commandMap };