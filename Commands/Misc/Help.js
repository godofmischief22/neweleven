const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = new Object({
    name: "help",
    description: "Shows bot’s help panel.",
    category: "Misc",
    usage: "",
    cooldown: 10,
    usage: "[command_name]",
    aliases: ["h", "commands", "cmds"],
    examples: ["help", "help play", "help p"],
    sub_Commands: [],
    args: false,
    permissions: {
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color) {
        if (args.length) {
            let name, c;
            const categories = [
                "Music",
                "Filters",
                "Settings",
                "Misc",
                "Playlist",
                "Audiophile"
            ];
            const categoryMap = {
                music: "Music",
                audiophile: "Audiophile",
                filters: "Filters",
                settings: "Settings",
                config: "Settings",
                misc: "Misc",
                playlist: "Playlist",
            };

            if (Object.keys(categoryMap).includes(args[0].toLowerCase())) {
                name = categoryMap[args[0].toLowerCase()];
                c = client.Commands.filter(
                    (x) => x.category && x.category === name,
                ).map((x) => `\`${x.name}\``);

                return await message
                    .reply({
                        embeds: [
                            client
                                .embed()
                                .setColor(color)
                                .setTitle(`${name} Commands`)
                                .setDescription(c.join(", "))
                                .setFooter({
                                    text: `Total ${c.length} ${name.toLowerCase()} Commands.`,
                                }),
                        ],
                    })
                    .catch(() => {});
            } else {
                const command =
                    client.Commands.get(args[0]) ||
                    client.Commands.get(client.Aliases.get(args[0]));
                if (!command)
                    return await client.util.oops(
                        message.channel,
                        `Cannot find the command called "${args[0]}"`,
                        color,
                    );

                let commandAliases = [];
                if (Array.isArray(command.aliases))
                    for (let i of command.aliases)
                        commandAliases.push(`${prefix}${i}`);

                let commandExamples = [];
                if (Array.isArray(command.examples))
                    for (let i of command.examples)
                        commandExamples.push(`${prefix}${i}`);

                let CommandsubCommands = [];
                if (Array.isArray(command.sub_Commands))
                    for (i of command.sub_Commands)
                        CommandsubCommands.push(
                            `${prefix}${command.name} ${i}`,
                        );

                const fieldData = [
                    {
                        name: "・Usage",
                        value: `${command.usage ? `> **<:11dot:1365974349244268544> ${prefix}${command.name}**` : `..`}`,
                        inline: false,
                    },
                    {
                        name: "・Cooldown",
                        value: `${command.cooldown ? `> \`[ ${client.util.msToTime(1000 * command.cooldown)} ]\`` : "`[ 3s ]`"}`,
                        inline: false,
                    },
                    {
                        name: "・Category",
                        value: `> <:11dot:1365974349244268544> **${command.category ? command.category : "None"}**`,
                        inline: false,
                    },
                ];

                if (commandAliases.length > 0)
                    fieldData.push({
                        name: "・Aliases",
                        value: `> ${commandAliases.map((x) => `<:11dot:1365974349244268544> **${x}**`).join(", ")}`,
                        inline: false,
                    });

                if (
                    CommandsubCommands.length > 0 &&
                    CommandsubCommands.length < 5
                )
                    fieldData.push({
                        name: "・Sub command(s)",
                        value: `> ${CommandsubCommands.map((x) => `<:11dot:1365974349244268544> **${x}**`).join("\n")}`,
                        inline: false,
                    });

                if (commandExamples.length > 0 && commandExamples.length < 5)
                    fieldData.push({
                        name: "・Example(s)",
                        value: `> ${commandExamples.map((x) => `**<:11dot:1365974349244268544> ${x}**`).join("\n")}`,
                        inline: false,
                    });

                const embed2 = client
                    .embed()
                    .setColor(color)
                    .setDescription(command.description)
                    .setTitle(`__${command.name}__ Command Help`)
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .addFields(fieldData);

                return await message
                    .reply({ embeds: [embed2] })
                    .catch(() => {});
            }
        } else {
            const embed = client
                .embed()
                .setAuthor({name : `Help Menu`, url : `https://discord.gg/ZRXSwG3Xb6`, iconURL : client.user.displayAvatarURL()})
                .setThumbnail(message.author.displayAvatarURL())
                .setDescription(
                    `
<:11wave:1365988574712954941> **Heyy.. ${message.author.username}! I'm Eleven A Minimalistic Music Bot Packed With Features Never Seen Before!**

- <:11mil:1365988908529225790> **Command Categories ~** 
  - <:11music:1365989327674413077> **Music**
  - <:11audiophile:1365989462970077246> **Audiophile**
  - <:11musicWaves:1365989818714292264> **Filters**
  - <:11utility:1365989914751270963> **Settings**
  - <:11misc:1365974952913928262> **Misc**
  - <:11playlist:1365990144674631710> **Playlist**

> <:11dot:1365974349244268544> **Use the dropdown below to get more info**
                    `,
                )
                .setColor(color);

            const emojis = {
                Music: `<:11music:1365989327674413077>`,
                Filters: `<:11musicWaves:1365989818714292264>`,
                Settings: `<:11utility:1365989914751270963>`,
                Misc: `<:11misc:1365974952913928262>`,
                Playlist: `<:11playlist:1365990144674631710>`,
                Audiophile: `<:11audiophile:1365989462970077246>`
            };
            const selectMenuArray = [];

            for (const category of client.Commands.map(
                (x) => x.category,
            ).filter((x, i, a) => a.indexOf(x) === i)) {
                if (category && emojis[category]) {
                    selectMenuArray.push({
                        label: category,
                        value: category,
                        description: `View ${category} commands`,
                        emoji: emojis[category],
                    });
                }
            }

            const selectMenuRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("HELP_SELECT_MENU")
                    .setPlaceholder("Browse Commands Of Eleven")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(selectMenuArray),
                    
            );

            client.on("interactionCreate", async (interaction) => {
                if (!interaction.isStringSelectMenu()) return;
            
                if (interaction.customId === "HELP_SELECT_MENU") {
                    const categoryName = interaction.values[0];
                    const categoryCommands = client.Commands.filter(
                        (x) => x.category === categoryName,
                    ).map((x) => `\`${x.name}\``);
            
                    const embed = new EmbedBuilder()
                        .setTitle(`${categoryName} Commands`)
                        .setDescription(categoryCommands.join(", "))
                        .setFooter({
                            text: `Total ${categoryCommands.length} ${categoryName} commands.`,
                        });
            
                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true, // Only visible to the user who triggered the interaction
                    });
                }
            });

            await message.reply({
                embeds: [embed],
                components: [selectMenuRow],
            });
        }
    },
});
