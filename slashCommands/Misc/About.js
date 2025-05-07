const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const _setupdata = require('../../Models/Setup');
const _djdata = require('../../Models/Dj');
const _tfsdata = require('../../Models/247');
const _announcedata = require('../../Models/Announce');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Shows the information about the bot.'),

    async execute(interaction, client) {
        const player = client.dispatcher.players.get(interaction.guildId);

        let _247data = await _tfsdata.findOne({ _id: interaction.guildId });
        let djdata = await _djdata.findOne({ _id: interaction.guildId });
        let announcedata = await _announcedata.findOne({ _id: interaction.guildId });
        let setupdata = await _setupdata.findOne({ _id: interaction.guildId });

        // Embed 1: About Eleven
        const embed1 = client.embed()
            .setAuthor({
                name: `About Eleven ~ HomePage`,
                iconURL: client.user.displayAvatarURL(),
                url: client.config.links.support,
            })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setColor(color)
            .setDescription(
                `> <:11dot:1365974349244268544> **Eleven - Let Eleven spin the tunes and elevate your vibe!** \n\n *Meet Eleven, your personal DJ on Discord! Bringing you the beats, rhythm, and vibes you love, all in one seamless experience.*`
            )
            .addFields(
                {
                    name: "ㅤ",
                    value: `<:11link:1365987240773287996> **[Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) | [Support](https://discord.gg/ZRXSwG3Xb6) | [Vote](https://top.gg/bot/${client.user.id}/vote)**`,
                    inline: false,
                }
            )
            .setFooter({
                text: `Requested By : ${message.author.displayName}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            });

        // Embed 2: Developers
const embed2 = client.embed()
    .setAuthor({
        name: `About Eleven ~ Developers`,
        url: `https://discord.gg/ZRXSwG3Xb6`,
        iconURL: client.user.displayAvatarURL(),
    })
    .setDescription(`
        <:11dot:1365974349244268544> **Below is the information about the Team behind Eleven.**

        > <:11dev:1365984904164147201> **Owner & Developer**
        \`-\` **[Aadarsh](https://discord.com/users/YOUR_USER_ID)**
        <a:qt:1145009408636629123> **Status: Simping, I guess?**
        <:11link:1365987240773287996> **Socials: [Discord](https://discord.gg/ZRXSwG3Xb6)**
        **-------------------------**
    `)
    .setColor(color); // <-- you were missing this


        // Navigation buttons
        const navigationRow = (show1, show2, show3) => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(show1)
                .setLabel('About Eleven')
                .setEmoji('<:eleven:1366043186685804564>')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(show2)
                .setLabel('About Developers')
                .setEmoji('<:11dev:1365984904164147201>')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(show3)
                .setLabel('Other Bots')
                .setEmoji('<:11link:1365987240773287996>')
                .setStyle(ButtonStyle.Primary),
        );

        // Reply with initial embed and buttons
        const messageResponse = await interaction.reply({
            embeds: [embed1],
            components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
            fetchReply: true, // Fetch the reply to create a collector
        });

        const filter = (i) =>
            ['showEmbed1', 'showEmbed2', 'showEmbed3'].includes(i.customId) &&
            i.user.id === interaction.user.id;

        const collector = messageResponse.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'showEmbed1') {
                await i.update({
                    embeds: [embed1],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            } else if (i.customId === 'showEmbed2') {
                await i.update({
                    embeds: [embed2],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            } else if (i.customId === 'showEmbed3') {
                await i.update({
                    embeds: [embed3],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            }
        });

        collector.on('end', () => {
            messageResponse.edit({ components: [] });
        });
    },
};
