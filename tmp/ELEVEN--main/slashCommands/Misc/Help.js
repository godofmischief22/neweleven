const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows bot’s help panel.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command name to get help on')
                .setRequired(false)),

    category: "Misc",
    cooldown: 10,
    permissions: {
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, interaction, color) {
        const args = interaction.options.getString('command');

        if (args) {
            let name, c;
            const categories = [
                "Music",
                "Filters",
                "Settings",
                "Misc",
                "Playlist",
            ];
            const categoryMap = {
                music: "Music",
                filters: "Filters",
                settings: "Settings",
                config: "Settings",
                misc: "Misc",
                playlist: "Playlist",
            };

            if (Object.keys(categoryMap).includes(args.toLowerCase())) {
                name = categoryMap[args.toLowerCase()];
                c = client.commands.filter(x => x.category && x.category === name).map(x => `\`${x.data.name}\``);

                return await interaction.reply({
                    embeds: [
                        client.embed()
                            .setColor(color)
                            .setTitle(`${name} Commands`)
                            .setDescription(c.join(', '))
                            .setFooter({ text: `Total ${c.length} ${name.toLowerCase()} Commands.` })
                    ]
                });
            } else {
                const command = client.commands.get(args.toLowerCase()) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args.toLowerCase()));
                if (!command)
                    return await interaction.reply({ content: `Cannot find the command called "${args}"`, ephemeral: true });

                let commandAliases = [];
                if (Array.isArray(command.aliases)) {
                    for (let i of command.aliases) {
                        commandAliases.push(`/${i}`);
                    }
                }

                let commandExamples = [];
                if (Array.isArray(command.examples)) {
                    for (let i of command.examples) {
                        commandExamples.push(`/${i}`);
                    }
                }

                let CommandsubCommands = [];
                if (Array.isArray(command.sub_Commands)) {
                    for (i of command.sub_Commands) {
                        CommandsubCommands.push(`/${command.data.name} ${i}`);
                    }
                }

                const fieldData = [
                    {
                        name: "・Usage",
                        value: `${command.usage ? `> **<:11dot:1365974349244268544> /${command.data.name}**` : `..`}`,
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

                if (commandAliases.length > 0) {
                    fieldData.push({
                        name: "・Aliases",
                        value: `> ${commandAliases.map(x => `<:11dot:1365974349244268544> **${x}**`).join(", ")}`,
                        inline: false,
                    });
                }

                if (CommandsubCommands.length > 0 && CommandsubCommands.length < 5) {
                    fieldData.push({
                        name: "・Sub command(s)",
                        value: `> ${CommandsubCommands.map(x => `<:11dot:1365974349244268544> **${x}**`).join("\n")}`,
                        inline: false,
                    });
                }

                if (commandExamples.length > 0 && commandExamples.length < 5) {
                    fieldData.push({
                        name: "・Example(s)",
                        value: `> ${commandExamples.map(x => `**<:11dot:1365974349244268544> ${x}**`).join("\n")}`,
                        inline: false,
                    });
                }

                const embed2 = client.embed()
                    .setColor(color)
                    .setDescription(command.description)
                    .setTitle(`__${command.data.name}__ Command Help`)
                    .addFields(fieldData);

                return await interaction.reply({ embeds: [embed2] });
            }
        } else {
            const embed = client.embed()
                .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
                .setDescription(
                    `
<:11mil:1365988908529225790> **A minimalistic music bot with a lot of features.**

<:eg_discovery:1365996409500864562> **Command Categories ~** 
> <:11music:1365989327674413077> **Music**
> <:11audiophile:1365989462970077246> **Audiophile**
> <:11musicWaves:1365989818714292264> **Filters**
> <:11utility:1365989914751270963> **Settings**
> <:11playlist:1365990144674631710> **Playlist**
> <:11misc:1365974952913928262> **Misc**

<:eleven:1366043186685804564> **Links ~**
>  **[Team Eleven](https://discord.gg/ZRXSwG3Xb6) | [Invite Me](https://discord.com/oauth2/authorize?client_id=1248702147210514514&scope=bot&permissions=831679622985)**
`
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setImage("https://github.com/akshew/image-hosting/blob/main/eleven.png?raw=true")
                .setColor(client.color)
                .setTimestamp()
                .setFooter({
                    text: `Thank you ${interaction.user.tag}, for using me.`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                });

            const emojis = {
                Music: `<:11music:1365989327674413077>`,
                Filters: `<:11musicWaves:1365989818714292264>`,
                Settings: `<:11utility:1365989914751270963>`,
                Misc: `<:11misc:1365974952913928262>`,
                Playlist: `<:11playlist:1365990144674631710>`,
                Audiophile: `<:11audiophile:1365989462970077246>`,
            };

            const selectMenuArray = [];

            for (const category of client.commands.map(x => x.category).filter((x, i, a) => a.indexOf(x) === i)) {
                if (category === "Developers") continue;
                selectMenuArray.push({
                    label: category,
                    value: category,
                    description: `View ${category} commands`,
                    emoji: emojis[category],
                });
            }

            const selectMenuRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("HELP_SELECT_MENU")
                        .setPlaceholder("Browse Commands Of Eleven")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(selectMenuArray)
                );

            const m = await interaction.reply({
                embeds: [embed],
                components: [selectMenuRow],
                fetchReply: true,
            });

            const collector = m.createMessageComponentCollector({
                filter: (b) => {
                    if (b.user.id === interaction.user.id) return true;
                    else {
                        b.reply({
                            ephemeral: true,
                            content: `Only **${interaction.user.tag}** can use this button.`,
                        });
                        return false;
                    }
                },
                time: 30000,
                idle: 60000,
            });

            collector.on("end", async () => {
                if (!m) return;
                return m.edit({ components: [] }).catch(() => {});
            });

            collector.on("collect", async (interaction) => {
                if (interaction.customId !== "HELP_SELECT_MENU") return;
                interaction.deferUpdate();
                const selected = interaction.values[0];
                const categoryName = selected;
                const cmds = client.commands.filter(x => x.category && x.category === categoryName).map(x => `\`${x.data.name}\``);
                const embed1 = client.embed()
                    .setColor(client.color)
                    .setTitle(`${emojis[categoryName]} ${categoryName} commands`)
                    .setDescription(cmds.join(', '))
                    .setFooter({ text: `Total ${cmds.length} ${categoryName} commands.` });

                if (m) {
                    await m.edit({
                        embeds: [embed1],
                        components: [selectMenuRow],
                    });
                }
            });
        }
    },
};
