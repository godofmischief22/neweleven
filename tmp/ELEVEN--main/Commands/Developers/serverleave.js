const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "serverleave",
    category: "Developer",
    aliases: ["sleft", "sleave"],
    description: "",
    cooldown: 5,
    args: true, 
    usage: "<server_id>",
    permission: [],
    owner: true,
    async execute(client, message, args, prefix, color) {

        const owners = ["747321055319949312"];

        if (!owners.includes(message.author.id)) {
            return message.channel.send({ 
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000') 
                    .setDescription(`<:crosss:1144288980385415279> You do not have permission to use this command.`)
                ] 
            });
        }
        let id = args[0];
        if (!id) {
            return message.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`<:crosss:1144288980385415279> You didn't provide the server ID.`)
                ] 
            });
        }

        let guild;
        try {
            guild = await client.guilds.fetch(id);
        } catch (error) {
            return message.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`<:crosss:1144288980385415279> Invalid server ID or unable to fetch the server.`)
                ] 
            });
        }

        if (!guild) {
            return message.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`<<:crosss:1144288980385415279> No guild found with ID: **${id}**.`)
                ] 
            });
        }

        await guild.leave();
        let embed = new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(`<:tick:1365995106645053580> Successfully left the guild with ID: **${id}**`);

        message.reply({ embeds: [embed] });
    }
};
