const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const _setupdata = require("../../Models/Setup"),
    _djdata = require("../../Models/Dj"),
    _tfsdata = require("../../Models/247"),
    _announcedata = require("../../Models/Announce");

module.exports = {
    name: "about",
    description: "Shows the Information of bot.",
    category: "Misc",
    usage: "",
    cooldown: 10,
    aliases: ["aboutbot"],
    examples: [""],
    sub_commands: [],
    args: false,
    permissions: {
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },
    /**
     *
     * @param {import("../../../Main")} client
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     */
    async execute(client, message, args, prefix, color) {
        const player = client.dispatcher.players.get(message.guildId);

        let _247data = await _tfsdata.findOne({ _id: message.guildId });
        let djdata = await _djdata.findOne({ _id: message.guildId });
        let announcedata = await _announcedata.findOne({ _id: message.guildId });
        let setupdata = await _setupdata.findOne({ _id: message.guildId });

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
                .setLabel("About Eleven")
                .setEmoji("<:eleven:1285522157623050324>")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(show2)
                .setLabel("About Developers")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(show3)
                .setLabel("Other Bots")
                .setStyle(ButtonStyle.Success),
        );

        const messageResponse = await message.reply({
            embeds: [embed1],
            components: [navigationRow("showEmbed1", "showEmbed2", "showEmbed3")],
        });

        const filter = (i) =>
            ["showEmbed1", "showEmbed2", "showEmbed3"].includes(i.customId) &&
            i.user.id === message.author.id;

        const collector = messageResponse.createMessageComponentCollector({
            filter,
            time: 600000,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "showEmbed1") {
                await interaction.update({
                    embeds: [embed1],
                    components: [navigationRow("showEmbed1", "showEmbed2", "showEmbed3")],
                });
            } else if (interaction.customId === "showEmbed2") {
                await interaction.update({
                    embeds: [embed2],
                    components: [navigationRow("showEmbed1", "showEmbed2", "showEmbed3")],
                });
            } else if (interaction.customId === "showEmbed3") {
                await interaction.update({
                    embeds: [embed3],
                    components: [navigationRow("showEmbed1", "showEmbed2", "showEmbed3")],
                });
            }
        });

        collector.on("end", () => {
            messageResponse.edit({ components: [] });
        });
    },
};
