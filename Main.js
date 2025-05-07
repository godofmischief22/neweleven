const { Collection, WebhookClient, REST, Routes } = require("discord.js");
const { Main } = require("./Base/Client");
const fs = require("fs");
require('dotenv').config(); // Load environment variables from a .env file
const config = require("./Config");

const client = new Main();
client.commands = new Collection(); // Initialize commands collection
module.exports = client;

// Set up the WebhookClient for sending error messages
const channel = new WebhookClient({ url: client.config.hooks.Error });
const color = client.color;

// Load and register commands from the slashCommands directory
const commandFolders = fs.readdirSync("./slashCommands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./slashCommands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  
  for (const file of commandFiles) {
    try {
      const command = require(`./slashCommands/${folder}/${file}`);
      if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`Command in ${file} has no valid name, skipping.`);
      }
    } catch (err) {
      console.error(`Failed to load command ${file}: ${err.message}`);
    }
  }
}

// Register commands only after the bot is logged in
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Prepare all commands for registration
  const commands = client.commands.map((command) => command.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(config.Token);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationCommands(client.user.id), // Use applicationGuildCommands for specific guilds
      { body: commands }
    );
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error while registering commands:", error);
    if (channel) {
      await channel.send({
        embeds: [
          client.embed()
            .setColor(color)
            .setTitle("Error Registering Commands")
            .setDescription(`\`\`\`js\n${error}\n\`\`\``)
            .setTimestamp(),
        ],
      });
    }
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection:", reason, promise);
  if (channel) {
    await channel.send({
      embeds: [
        client.embed()
          .setColor(color)
          .setTitle("Unhandled Rejection")
          .setDescription(`\`\`\`js\n${reason}\n\n${promise}\n\`\`\``)
          .setTimestamp(),
      ],
    }).catch((err) => {
      console.error("Error sending rejection to webhook:", err);
    });
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error, origin) => {
  console.error("Uncaught Exception:", error, origin);
  if (channel) {
    await channel.send({
      embeds: [
        client.embed()
          .setColor(color)
          .setTitle("Uncaught Exception")
          .setDescription(`\`\`\`js\n${error.stack ? error.stack : error}\n\n${origin}\n\`\`\``)
          .setTimestamp(),
      ],
    }).catch((err) => {
      console.error("Error sending exception to webhook:", err);
    });
  }
});

client.login(config.Token)
  .catch((err) => {
    console.error("Error logging in:", err);
    if (channel) {
      channel.send({
        embeds: [
          client.embed()
            .setColor(color)
            .setTitle("Login Error")
            .setDescription(`\`\`\`js\n${err}\n\`\`\``)
            .setTimestamp(),
        ],
      }).catch(() => {});
    }
  });
