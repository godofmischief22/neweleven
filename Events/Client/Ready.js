const db = require("../../Models/247"),
    db2 = require("../../Models/Setup");

module.exports = new Object({
    name: "ready",
    /**
     * @param {import("../../Main")} client
     */
    async execute(client) {
        client.console.log(`Logged in as ${client.user.tag}`, "api");
        const maindata = await db.find();
        client.console.log(
            `Auto Reconnect found ${maindata.length ? `${maindata.length} queue${maindata.length > 1 ? "s" : ""}. Resuming all auto reconnect queue` : "0 queue"}`,
            "player",
        );
        for (const data of maindata) {
            const index = maindata.indexOf(data);
            setTimeout(async () => {
                const text = client.channels.cache.get(data.textChannel);
                const guild = client.guilds.cache.get(data._id);
                const voice = client.channels.cache.get(data.voiceChannel);
                if (!guild || !text || !voice) return data.delete();
                const player = client.dispatcher.createPlayer({
                    guildId: guild.id,
                    textId: text.id,
                    voiceId: voice.id,
                    deaf: true,
                    shardId: guild.shardId,
                });
            }),
                index * 5000;
        }

        db2.find({ setuped: true }, async (_, guilds) => {
            for (const data of guilds) {
                const guild = client.guilds.cache.get(data.id);
                if (guild) {
                    const channel = guild.channels.cache.get(data.channel);
                    if (channel) {
                        const message = await channel.messages.fetch(
                            data.message,
                            { cache: true },
                        );
                        if (!message) return;
                        if (message) {
                            const embed1 = client
                                .embed()
                                .setColor(client.color)
                                .setTitle(
                                    "Nothing playing right now in this server!",
                                )
                                .setDescription(
                                    `• [Invite](${client.config.links.invite}) • [Vote](${client.config.links.vote}) • [Support Server](${client.config.links.support})`,
                                )
                                .setFooter({
                                    text: `Thanks for using ${client.user.username}`,
                                    iconURL: client.user.displayAvatarURL(),
                                })
                                .setImage(client.config.links.bg);

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
                                    embeds: [embed1],
                                    components: [row1, row2],
                                })
                                .catch(() => {});
                        } else {
                            data.message = null;
                            data.save();
                        }
                    } else {
                        data.channel = null;
                        data.message = null;
                        data.save();
                    }
                } else {
                    await db2.deleteOne({ _id: data._id });
                }
            }
        });
    },
});
