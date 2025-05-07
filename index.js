const { Client, GatewayIntentBits, Collection, ActivityType, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { createPlayer } = require('./utils/player');

// Create a new client instance with necessary intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ] 
});

// Initialize collections for commands and components
client.commands = new Collection();
client.buttons = new Collection();
client.contextMenus = new Collection();
client.queues = new Map();

// Initialize player
client.player = createPlayer(client);

// Load slash commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js') && !fs.statSync(path.join(commandsPath, file)).isDirectory());

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set commands in the collection
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load button components
const buttonsPath = path.join(__dirname, 'commands/buttons');
if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);
        const button = require(filePath);
        // Set buttons in the collection
        if ('customId' in button && 'execute' in button) {
            client.buttons.set(button.customId, button);
        } else {
            console.log(`[WARNING] The button at ${filePath} is missing a required "customId" or "execute" property.`);
        }
    }
}

// Load context menu commands
const contextMenuPath = path.join(__dirname, 'commands/context-menu');
if (fs.existsSync(contextMenuPath)) {
    const contextMenuFiles = fs.readdirSync(contextMenuPath).filter(file => file.endsWith('.js'));
    for (const file of contextMenuFiles) {
        const filePath = path.join(contextMenuPath, file);
        const contextMenu = require(filePath);
        // Set context menus in the collection
        if ('data' in contextMenu && 'execute' in contextMenu) {
            client.contextMenus.set(contextMenu.data.name, contextMenu);
        } else {
            console.log(`[WARNING] The context menu at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Set bot activity
    client.user.setActivity(config.activity.name, { type: ActivityType.Listening });
});

// Handle all interaction types
client.on(Events.InteractionCreate, async interaction => {
    try {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction, client);
        }
        // Handle buttons
        else if (interaction.isButton()) {
            // Get the button ID or the primary part before any colons (for dynamic IDs)
            const buttonId = interaction.customId.includes(':') 
                ? interaction.customId.split(':')[0] 
                : interaction.customId;
                
            const button = client.buttons.get(buttonId);
            if (!button) return;
            await button.execute(interaction, client);
        }
        // Handle context menus
        else if (interaction.isContextMenuCommand()) {
            const contextMenu = client.contextMenus.get(interaction.commandName);
            if (!contextMenu) return;
            await contextMenu.execute(interaction, client);
        }
        // Handle Select Menus
        else if (interaction.isStringSelectMenu()) {
            // Extract the base ID from select menus (format often like 'select:something')
            const selectId = interaction.customId.includes(':') 
                ? interaction.customId.split(':')[0] 
                : interaction.customId;
                
            const selectMenu = client.selectMenus?.get(selectId);
            if (!selectMenu) return;
            await selectMenu.execute(interaction, client);
        }
    } catch (error) {
        console.error(error);
        const errorReply = { 
            content: 'There was an error while executing this interaction!', 
            ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorReply);
        } else {
            await interaction.reply(errorReply);
        }
    }
});

// Error handler for uncaught exceptions
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your client's token
client.login(config.token);
