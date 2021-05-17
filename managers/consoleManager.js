const readline = require('readline');

const registeredCommands = [];
const commandHandlerObjs = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function addCommand(handlerObj) {
    const regFailedTemplate = 'Failed to register a command. Reason: ';
    if (!handlerObj.command) return console.log(`${regFailedTemplate}provide a command property.`);
    if (!handlerObj.handler) return console.log(`${regFailedTemplate}provide a handler property.`);
    const commandObj = {
        command: handlerObj.command,
        aliases: handlerObj.aliases || [],
        description: handlerObj.description || 'No description provided'
    };
    if (!handlerObj.aliases) handlerObj.aliases = [];
    if (!handlerObj.description) handlerObj.description = 'No description provided';
    registeredCommands.push(commandObj);
    commandHandlerObjs.push(handlerObj);
}

function init() {
    rl.on('line', (input) => {
        const handlerObj = findCommandObj(input);
        if (!handlerObj) return;
        const command = handlerObj.command;
        const args = handlerObj.args;
        handlerObj.handler(command, args);
    });
}

function findCommandObj(content) {
    for (const handlerObj of commandHandlerObjs) {
        const command = handlerObj.command;
        const aliases = handlerObj.aliases || [];
        const contentSplit = content.split(/\s+/);
        const executedCommand = contentSplit[0];
        contentSplit.shift();
        const args = contentSplit;
        const obj = {
            handler: handlerObj.handler,
            args,
            command,
            aliases,
            description: handlerObj.description
        };
        if (executedCommand === command) return obj;
        for (const alias of aliases) {
            if (args[0] !== alias) continue;
            return obj;
        }
    }
}

module.exports.addCommand = addCommand;
module.exports.init = init;
module.exports.commandHandlerObjs = commandHandlerObjs;