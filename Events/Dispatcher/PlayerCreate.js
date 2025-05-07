const db = require("../../Models/Setup");
module.exports = new Object({
    name: "playerCreate",
    /**
     * @param {import("../../Main")} client
     * @param {import("kazagumo").KazagumoPlayer} dispatcher
     */
    async execute(client, dispatcher) {
        const guild = client.guilds.cache.get(dispatcher.guildId);
        if (!guild) return;
        const data = await db.findOne({ _id: guild.id });
        if (!data) return;
        const channel = guild.channels.cache.get(data.channel);
        if (!channel) return;
        let message;
        try {
            message = await channel.messages.fetch(data.message, {
                cache: true,
            });
        } catch (e) {}
        if (!message) return;

        const pausebut = client
            .button()
            .setCustomId("pause_but")
            .setEmoji("<:supremepause:1366015098673561692>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const lowvolumebut = client
            .button()
            .setCustomId("lowvolume_but")
            .setEmoji("<:stolen_emoji:1366010164272037981>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const highvolumebut = client
            .button()
            .setCustomId("highvolume_but")
            .setEmoji("<:stolen_emoji:1366010164272037981>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const previousbut = client
            .button()
            .setCustomId("previous_but")
            .setEmoji("<:supremeback:1366015538106728551>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const skipbut = client
            .button()
            .setCustomId("skipbut_but")
            .setEmoji("<:stolen_emoji:1366010164272037981>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const rewindbut = client
            .button()
            .setCustomId("rewindbut_but")
            .setEmoji("<:supremereplay:1366015723394306070>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const forwardbut = client
            .button()
            .setCustomId("forward_but")
            .setEmoji("<:supremenext:1366015854256590849>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const autoplaybut = client
            .button()
            .setCustomId("autoplay_but")
            .setEmoji("<:stolen_emoji:1366010164272037981>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const loopmodesbut = client
            .button()
            .setCustomId("loopmodesbut_but")
            .setEmoji("<:supremeloop:1366016024528289893>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);
        const stopbut = client
            .button()
            .setCustomId("stop_but")
            .setEmoji("<:stolen_emoji:1366010164272037981>")
            .setStyle(client.config.button.grey)
            .setDisabled(true);

        const row1 = client
            .row()
            .addComponents([
                lowvolumebut,
                previousbut,
                pausebut,
                skipbut,
                highvolumebut,
            ]);
        const row2 = client
            .row()
            .addComponents([
                rewindbut,
                autoplaybut,
                stopbut,
                loopmodesbut,
                forwardbut,
            ]);

        await message
            .edit({
                content:
                    "__**Join a voice channel and queue songs by name/url.**__\n\n",
                components: [row1, row2],
            })
            .catch(() => {});
    },
});
