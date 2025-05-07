const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aboutprem')
        .setDescription('Shows the premium benefits and pricing plans.'),

    async execute(interaction, client) {
        // Create the embeds
        const embed = client.embed()
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTitle('Premium Features')
            .setColor('#ff0000') // Replace with your desired color
            .setDescription(`<:eleven:1366043186685804564> **Unlock the full potential of Eleven with premium!** \n\n **With a premium membership, you get access to __exclusive__ features, enhanced performance, and priority support. Upgrade your experience and take your server to the next level!**`)
            .addFields(
                {
                    name: '<:11prem:1365975457434177586> `.` Premium Benefits',
                    value: `\`-\` Access to exclusive premium commands\n\`-\` Enhanced music quality and performance\n\`-\` Priority support from the dev team\n\`-\` Customizable bot features\n\`-\` And much more!`,
                    inline: false,
                },
                {
                    name: '<:11misc:1365974952913928262> `.` How to Get Premium',
                    value: `\`-\` [Purchase Premium](https://discord.gg/ZRXSwG3Xb6) By Creating a Ticket in the Support Server to upgrade your server.`,
                    inline: false,
                },
                {
                    name: '<:11link:1365987240773287996> `.` Links',
                    value: `\`-\` [Support](https://discord.gg/ZRXSwG3Xb6) : [Vote](https://top.gg/bot/${client.user.id}/vote) `,
                    inline: false,
                }
            )
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        const embed2 = client.embed()
            .setTitle('<a:Arrow:1144838236464762940> **Premium Features and Pricing**')
            .addFields(
                {
                    name: '<:11dot:1287835131633209446> **Premium Features**',
                    value: `\`1.\` **No Prefix**\n\`2.\` **Radio**\n\`3.\` **Custom Playlist**\n\`4.\` **No Vote**`,
                },
                {
                    name: '<:11prem:1365975457434177586> **Monthly Plan**',
                    value: `\`\`\` - 70 INR/month - Access to all premium features\`\`\``,
                },
                {
                    name: '<:11prem:1365975457434177586> **Yearly Plan**',
                    value: `\`\`\` - 500 INR/year - Save 2 months with yearly billing\`\`\``,
                },
            )
            .setImage('https://github.com/akshew/image-hosting/blob/main/eleven.png?raw=true');

        const customElevenEmbed = client.embed()
            .setTitle('Custom Eleven')
            .setDescription(`
                <:11star:1366009325675347988> **Introducing Custom Eleven**

                > \`-\` What is Custom Eleven? 
                > \`-\` **So, it is a custom instance of Eleven. Where it will have a custom name, custom profile picture, custom bio, custom embed color, etc.**

                Features of Custom Eleven
                > \`-\` Custom name, bio, avatar, embed colors, etc.
                > \`-\` Dedicated Node for music.
                > \`-\` No downtime and glitches.
                > \`-\` Totally Yours.
                > \`-\` 24/7 Support.
                > and much more...

                **That is just for 250 INR/month**
            `)
            .setColor('#7289DA');

        // Create the action row for buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('showEmbed2')
                .setLabel('View Pricing Plans')
                .setEmoji('<:11prem:1365975457434177586>')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('customEleven')
                .setLabel('Custom Eleven')
                .setEmoji('<:nconfig:1365993015314747402>')
                .setStyle(ButtonStyle.Success)
        );

        // Send the initial response with embeds and buttons
        const sentMessage = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true, // Fetch the reply to create a collector
        });

        const filter = (i) => (i.customId === 'showEmbed2' || i.customId === 'customEleven') && i.user.id === interaction.user.id;

        const collector = sentMessage.createMessageComponentCollector({
            filter,
            time: 15000, // 15 seconds
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'showEmbed2') {
                await interaction.update({
                    embeds: [embed2],
                    components: [],
                });
            } else if (interaction.customId === 'customEleven') {
                await interaction.reply({
                    embeds: [customElevenEmbed],
                    ephemeral: true,
                });
            }
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('showEmbed2')
                    .setLabel('View Pricing Plans')
                    .setEmoji('<:11prem:1365975457434177586>')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('customEleven')
                    .setLabel('Custom Eleven')
                    .setEmoji('<:nconfig:1365993015314747402>')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true)
            );
            await sentMessage.edit({ components: [disabledRow] });
        });
    },
};
