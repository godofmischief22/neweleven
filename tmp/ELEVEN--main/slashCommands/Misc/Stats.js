const { SlashCommandBuilder } = require('discord.js');
const os = require('os');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows a deep status of the bot.'),

    async execute(interaction, client) {
        const dbPing = async () => {
            const currentNano = process.hrtime();
            await mongoose.connection.db.command({ ping: 1 });
            const time = process.hrtime(currentNano);
            return Math.round((time[0] * 1e9 + time[1]) * 1e-6);
        };

        const embed = client.embed()
            .setColor('#ff0000') // Set a default color or use a parameter
            .setTimestamp()
            .setImage('https://github.com/akshew/image-hosting/blob/main/eleven.png?raw=true')
            .setFooter({
                text: `${interaction.guild.shardId}/${client.shard?.count || 1} shards`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setDescription('<:11dot:1365974349244268544> **[Below Are the statistics of Eleven Music.](https://discord.gg/teamkronix)**\n')
            .addFields([
                {
                    name: '<:nconfig:1365993015314747402> Status',
                    value: `> <:Latency:1365993187721740298> **Bot Latency :** \`${Math.round(client.ws.ping)} ms\`\n> <:db:1365993392567357502> **DataBase Latency :**  \`${await dbPing()} ms\`\n> <:MekoTimer:1365993627515617281> **Uptime :** <t:${(Date.now() / 1000 - client.uptime / 1000).toFixed()}:R>\n> <:Commands:1365993866205073430> **Commands :** \`${client.Commands.map((x) => x.name).length}\``,
                    inline: false,
                },
                {
                    name: '<:KronixStats:1365994030319796286> Stats',
                    value: `> <:MekoServer:1365994235752611860> **Servers :** ${client.guilds.cache.size}\n> <:MekoUser:1365995335457181777> **Users : **${client.guilds.cache.reduce((x, y) => x + y.memberCount, 0)}\n> <:MekoChannel:1365995617599488096> **Channels :** ${client.channels.cache.size}`,
                    inline: false,
                },
                {
                    name: '<a:eventhost:1365995905513160755> Host',
                    value: `> <:11dot:1365974349244268544> **Platform :** \`${os.type()}\`\n> <:11dot:1365974349244268544> **Total Memory :** \`${client.util.formatBytes(os.totalmem())}\`\n> <:11dot:1365974349244268544> **Free Memory :** \`${client.util.formatBytes(os.freemem())}\``,
                    inline: false,
                },
                {
                    name: '<:eg_discovery:1365996409500864562> Library',
                    value: `> <:djs:1275458026337206313> **Discord.js :** v${require('discord.js').version}\n> <:js:1365996563528421388> **Node :** ${process.version}`,
                    inline: false,
                },
            ]);

        await interaction.reply({ embeds: [embed] });
    },
};
