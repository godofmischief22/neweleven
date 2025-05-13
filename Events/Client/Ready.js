const db = require("../../Models/247"),
    db2 = require("../../Models/Setup");
module.exports = {
    name: "ready",
    /**
     * @param {import("../../Main")} client
     */
    async execute(client) {
        client.console.log(`Logged in as ${client.user.tag}`, "api");
        // Wait for Lavalink node to be ready before resuming queues
        client.dispatcher.kazagumo.shoukaku.on("ready", async (name) => {
            client.console.log(`[Node] ${name} is ready! Resuming queues...`, "player");
            const maindata = await db.find();
            client.console.log(
                `Auto Reconnect found ${maindata.length ? `${maindata.length} queue${maindata.length > 1 ? "s" : ""}.` : "0 queue"}`,
                "player"
            );
            for (const data of maindata) {
                const index = maindata.indexOf(data);
                setTimeout(async () => {
                    const text = client.channels.cache.get(data.textChannel);
                    const guild = client.guilds.cache.get(data._id);
                    const voice = client.channels.cache.get(data.voiceChannel);
                    if (!guild || !text || !voice) return data.delete();
                    try {
                        await client.dispatcher.createPlayer({
                            guildId: guild.id,
                            textId: text.id,
                            voiceId: voice.id,
                            deaf: true,
                            shardId: guild.shardId,
                        });
                    } catch (e) {
                        client.console.log(`Failed to create player in ${guild.id}: ${e.message}`, "error");
                    }
                }, index * 5000);
            }
        });
        // Rebuild control panel UI in setup servers
        db2.find({ setuped: true }, async (_, guilds) => {
            for (const data of guilds) {
                const guild = client.guilds.cache.get(data.id);
                if (guild) {
                    const channel = guild.channels.cache.get(data.channel);
                    if (channel) {
                        const message = await channel.messages.fetch(data.message, { cache: true }).catch(() => null);
                        if (!message) return;
                        const embed1 = client
                            .embed()
                            .setColor(client.color)
                            .setTitle("Nothing playing right now in this server!")
                            .setDescription(
                                `• [Invite](${client.config.links.invite}) • [Vote](${client.config.links.vote}) • [Support Server](${client.config.links.support})`
                            )
                            .setFooter({
                                text: `Thanks for using ${client.user.username}`,
                                iconURL: client.user.displayAvatarURL(),
                            })
                            .setImage(client.config.links.bg);
                        const components = [
                            client.row().addComponents([
                                client.button().setCustomId("lowvolume_but").setEmoji("<:stolen_emoji:1366010164272037981>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("previous_but").setEmoji("<:supremeback:1366015538106728551>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("pause_but").setEmoji("<:supremepause:1366015098673561692>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("skipbut_but").setEmoji("<:stolen_emoji:1366010164272037981>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("highvolume_but").setEmoji("<:stolen_emoji:1366010164272037981>").setStyle(client.config.button.grey).setDisabled(true),
                            ]),
                            client.row().addComponents([
                                client.button().setCustomId("rewindbut_but").setEmoji("<:supremereplay:1366015723394306070>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("autoplay_but").setEmoji("<:stolen_emoji:1366010164272037981>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("stop_but").setEmoji("<:stolen_emoji:1366010164272037981>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("loopmodesbut_but").setEmoji("<:supremeloop:1366016024528289893>").setStyle(client.config.button.grey).setDisabled(true),
                                client.button().setCustomId("forward_but").setEmoji("<:supremenext:1366015854256590849>").setStyle(client.config.button.grey).setDisabled(true),
                            ])
                        ];
                        await message.edit({
                            content: "__**Join a voice channel and queue songs by name/url.**__\n\n",
                            embeds: [embed1],
                            components,
                        }).catch(() => {});
                    } else {
                        data.channel = null;
                        data.message = null;
                        data.save();
                    }
                } else {
                    await db2.deleteOne({ id: data.id });
                }
            }
        });
    },
};
