const { readdirSync } = require('node:fs');
const { join } = require('path');

/**
 * @param {import('../Main')} client
 */
module.exports = (client) => {
    let count = 0;
    const eventFiles = readdirSync(join(__dirname, "..", "Events", "Nodes")).filter((files) => files.endsWith(".js"));
    
    // Loop through each event file and register it
    for (const files of eventFiles) {
        const event = require(`../Events/Nodes/${files}`);
        client.dispatcher.shoukaku.on(event.name, (...args) => event.execute(client, ...args));
        count++;
    }

    // Adding event listeners directly in this file for node errors and close events
    const { Nodes } = client.config; // Assuming you're using config for nodes
    Nodes.forEach(node => {
        client.dispatcher.shoukaku.on(`nodeError:${node.name}`, (error) => {
            console.error(`Error on node ${node.name}:`, error);
            // Optionally send this error to your webhook or log somewhere
        });

        client.dispatcher.shoukaku.on(`nodeClose:${node.name}`, (code, reason) => {
            console.error(`Node ${node.name} closed. Code: ${code}, Reason: ${reason}`);
            // You can add logic to handle node reconnects or notifications here
        });
    });

    client.console.log(`Loaded: ${count} Node events`, "client");
};
