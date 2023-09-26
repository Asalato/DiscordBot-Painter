const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const {registerCommands} = require("./register");
const GuildStore = require("./guildStore");
const {temporaryMethodThatGetMessageByFetchingLatestChannelPost} = require("./utils");
const {execute_repaint} = require("./others/repaint");
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.data) client.commands.set(command.data.name, command);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, async (...args) => await event.execute(client, ...args));
    } else {
        client.on(event.name, async (...args) => await event.execute(client, ...args));
    }
}

client.on("interactionCreate", async (interaction) => await execute_repaint(interaction));

client.on('guildCreate', async guild => {
    const { id } = guild;
    await GuildStore.setId(id);
    await registerCommands(id);
});

(async () => {
    const ids = await GuildStore.getAllIds();
    for (const id of ids) {
        await registerCommands(id);
    }
})();

client.login(process.env.DISCORD_TOKEN);
