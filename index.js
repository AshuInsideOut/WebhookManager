const { WebhookClient, MessageEmbed } = require('discord.js');
const fs = require('fs');
const file = fs.readFileSync('./config.yml', 'utf8');
const config = require('yaml').parse(file);
const consoleManager = require('@abdevs/console-manager');
const { commandManager } = consoleManager;

commandManager.addCommand({
    command: 'stop',
    handler: async () => {
        console.log(`Thanks for using ABDevs Webhook Manager!`);
        process.exit(0);
    },
    description: 'Shutdown the application'
});

commandManager.addCommand({
    command: 'send',
    handler: async (command, args) => {
        if (args.length < 2) {
            console.log(`Incomplete arguments: [webhook-id] [content-id]`);
            return;
        }
        const webhookId = args[0];
        const contentId = args[1];
        const webhooks = config.webhooks;
        if (!webhooks.hasOwnProperty(webhookId)) {
            console.log(`${webhookId} is not defined in config!`);
            return;
        }
        const contents = config.contents;
        if (!contents.hasOwnProperty(contentId)) {
            console.log(`${contentId} is not defined in config!`);
            return;
        }
        const res = webhooks[webhookId].match(/discord.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/);
        const webhookClient = new WebhookClient(res[1], res[2]);
        const content = contents[contentId];
        let message = content.message;
        let embed;
        if (!message && !embed) {
            console.log(`Can't send an empty content`);
            return;
        }
        if (content.embed) {
            if (content.embed.description && Array.isArray(content.embed.description)) {
                let description = '';
                content.embed.description.forEach(line => description += `${line}\n`);
                content.embed.description = description;
            }
            embed = new MessageEmbed(generateEmbed(content.embed));
        }
        if (message && embed) webhookClient.send(message, embed);
        else if (message) webhookClient.send(message);
        else webhookClient.send(embed);
        console.log('Webhook sent to the channel!');
        webhookClient.destroy();
    },
    description: 'Sends a Webhook Message'
});

consoleManager.init();

console.log('\n====================================');
console.log('Welcome to ABDevs Webhook Manager');
console.log('====================================');
console.log('Run help for all the avaliable commands\n');

/**
 * @param {Object} obj
 * @return {Object}
 */
function deepCloneWithLose(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {any} obj
 * @return {MessageEmbed}
 */
function generateEmbed(obj) {
    const newObject = deepCloneWithLose(obj);
    if (!newObject.color) newObject.color = Utils.variables.config.EmbedColors.Default;
    if (typeof newObject.footer === 'string') newObject.footer = { text: newObject.footer };
    if (typeof newObject.author === 'string') newObject.author = { name: newObject.author };
    if (typeof newObject.thumbnail === 'string') newObject.thumbnail = { url: newObject.thumbnail };
    if (typeof newObject.image === 'string') newObject.image = { url: newObject.image };
    if (typeof newObject.timestamp === 'string') newObject.timestamp = parseInt(newObject.timestamp);
    if (newObject.description) newObject.description = newObject.description.toString().slice(0, 2048);
    return new MessageEmbed(newObject);
}