const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const commands = [];

// Load slash commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js') && !fs.statSync(path.join(commandsPath, file)).isDirectory());

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load context menu commands
const contextMenuPath = path.join(__dirname, 'commands/context-menu');
if (fs.existsSync(contextMenuPath)) {
    const contextMenuFiles = fs.readdirSync(contextMenuPath).filter(file => file.endsWith('.js'));
    for (const file of contextMenuFiles) {
        const filePath = path.join(contextMenuPath, file);
        const contextMenu = require(filePath);
        
        if ('data' in contextMenu && 'execute' in contextMenu) {
            commands.push(contextMenu.data.toJSON());
        } else {
            console.log(`[WARNING] The context menu at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Create and configure REST instance
const rest = new REST({ version: '10' }).setToken(config.token);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands with the current set
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
