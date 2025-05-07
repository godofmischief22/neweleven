const db = require("../../Models/Setup");
const { Token } = require("../../Config.js");
const axios = require("axios");
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "playerEnd",
    /**
     * @param {import("../../Main")} client
     * @param {import("kazagumo").KazagumoPlayer} dispatcher
     */
    async execute(client, dispatcher) {
        try {
            const guild = client.guilds.cache.get(dispatcher.guildId);
            if (!guild) return;

            const data = await db.findOne({ Guild: guild.id });
            if (!data) return;

            const channel = guild.channels.cache.get(data.channel);
            if (!channel) return;

            let message;
            try {
                message = await channel.messages.fetch(data.message, {
                    cache: true,
                });
            } catch (e) {
                console.error("Failed to fetch message:", e);
                return;
            }

            if (!message) return;

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("highvolume_but")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:volupp:1366020449942896662>"),
                new ButtonBuilder()
                    .setCustomId("previous_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:previouss:1366020483186692137>"),
                new ButtonBuilder()
                    .setCustomId("pause_but")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("<:pausess:1366020526182760518>"),
                new ButtonBuilder()
                    .setCustomId("skip_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:skipp:1366020572877688843>"),
                new ButtonBuilder()
                    .setCustomId("lowvolume_but")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:voldown:1366020619115954246>"),
            );

            await message
                .edit({
                    content: "__**Join a voice channel and queue songs by name/url**__\n\n",
                    components: [buttons],
                })
                .catch((error) => {
                    console.error("Failed to edit message:", error);
                });
        } catch (error) {
            console.error("Error in playerEnd event handler:", error);
        }
    },
};
