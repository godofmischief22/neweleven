const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a detailed help menu with all available commands')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Specific command category to show')
                .addChoices(
                    { name: '🎵 Music', value: 'music' },
                    { name: '🎛️ Controls', value: 'controls' },
                    { name: '⚙️ Settings', value: 'settings' },
                    { name: '📋 Playlists', value: 'playlists' },
                    { name: '📊 Stats', value: 'stats' }
                )
                .setRequired(false)),
    
    async execute(interaction, client) {
        const category = interaction.options.getString('category');
        
        if (category) {
            // Show specific category
            return this.showCategory(interaction, category);
        } else {
            // Show main help menu with categories
            return this.showMainMenu(interaction, client);
        }
    },
    
    async showMainMenu(interaction, client) {
        // Create main menu embed with attractive colors and styling
        const embed = new EmbedBuilder()
            .setTitle('🎵 Music Bot Help Menu')
            .setDescription('Welcome to the Discord Music Bot help menu! Select a category below to view commands.')
            .setColor('#FF0088') // Pink color like Lara Music
            .addFields(
                { 
                    name: '🎵 Music Commands', 
                    value: '`/play` `/search` `/pause` `/resume` `/skip` `/stop`', 
                    inline: false 
                },
                { 
                    name: '🎛️ Control Commands', 
                    value: '`/nowplaying` `/queue` `/volume` `/seek` `/loop`', 
                    inline: false 
                },
                { 
                    name: '⚙️ Settings Commands', 
                    value: '`/settings` `/dj` `/language` `/autoplay`', 
                    inline: false 
                },
                { 
                    name: '📋 Playlist Commands', 
                    value: '`/playlist` `/save` `/load` `/delete`', 
                    inline: false 
                },
                { 
                    name: '📊 Statistics Commands', 
                    value: '`/stats` `/ping` `/uptime` `/info`', 
                    inline: false 
                }
            )
            .setImage('https://i.imgur.com/nLxZJLd.png') // Add a music-themed image
            .setFooter({ 
                text: 'Use /help [category] for detailed information on each command' 
            })
            .setTimestamp();
            
        // Create buttons for category selection
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help:music')
                    .setLabel('Music')
                    .setEmoji('🎵')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help:controls')
                    .setLabel('Controls')
                    .setEmoji('🎛️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help:settings')
                    .setLabel('Settings')
                    .setEmoji('⚙️')
                    .setStyle(ButtonStyle.Primary)
            );
            
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help:playlists')
                    .setLabel('Playlists')
                    .setEmoji('📋')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help:stats')
                    .setLabel('Stats')
                    .setEmoji('📊')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help:support')
                    .setLabel('Support')
                    .setEmoji('❓')
                    .setStyle(ButtonStyle.Secondary)
            );
            
        // Send the message with buttons
        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [row1, row2],
            fetchReply: true
        });
        
        // Create a collector for button interactions
        const collector = response.createMessageComponentCollector({ 
            time: 60000 // 1 minute timeout
        });
        
        collector.on('collect', async (buttonInteraction) => {
            // Ensure only the user who triggered the command can use buttons
            if (buttonInteraction.user.id !== interaction.user.id) {
                await buttonInteraction.reply({ 
                    content: "You cannot use these buttons as you didn't trigger this command!", 
                    ephemeral: true 
                });
                return;
            }
            
            // Get the category from the button ID
            const [_, buttonCategory] = buttonInteraction.customId.split(':');
            
            if (buttonCategory === 'support') {
                // Display support information
                const supportEmbed = new EmbedBuilder()
                    .setTitle('❓ Support Information')
                    .setDescription('Need help with the Music Bot? Here\'s how to get support!')
                    .setColor('#FF0088')
                    .addFields(
                        { name: '📚 Documentation', value: 'Check out our documentation for detailed guides and examples.', inline: false },
                        { name: '🔧 Common Issues', value: 'Make sure the bot has proper permissions in your server and voice channel.', inline: false },
                        { name: '🌐 Commands', value: 'Use `/help [category]` to see detailed information about specific commands.', inline: false }
                    )
                    .setFooter({ text: 'Thank you for using our Music Bot!' });
                    
                await buttonInteraction.update({ embeds: [supportEmbed], components: [] });
            } else {
                // Display the selected category
                const categoryEmbed = this.getCategoryEmbed(buttonCategory);
                await buttonInteraction.update({ embeds: [categoryEmbed], components: [] });
            }
        });
        
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                // Remove buttons when collection times out
                interaction.editReply({ components: [] }).catch(console.error);
            }
        });
    },
    
    async showCategory(interaction, category) {
        const embed = this.getCategoryEmbed(category);
        await interaction.reply({ embeds: [embed] });
    },
    
    getCategoryEmbed(category) {
        switch (category) {
            case 'music':
                return new EmbedBuilder()
                    .setTitle('🎵 Music Commands')
                    .setColor('#FF0088')
                    .setDescription('Commands for playing and managing music')
                    .addFields(
                        { 
                            name: '`/play [query]`', 
                            value: 'Play a song from YouTube by URL or search query.\nExample: `/play despacito`', 
                            inline: false 
                        },
                        { 
                            name: '`/search [query]`', 
                            value: 'Search for songs and select from results.\nExample: `/search lofi beats`', 
                            inline: false 
                        },
                        { 
                            name: '`/pause`', 
                            value: 'Pause the currently playing song.', 
                            inline: false 
                        },
                        { 
                            name: '`/resume`', 
                            value: 'Resume playback of the paused song.', 
                            inline: false 
                        },
                        { 
                            name: '`/skip`', 
                            value: 'Skip to the next song in the queue.', 
                            inline: false 
                        },
                        { 
                            name: '`/stop`', 
                            value: 'Stop playback and clear the queue.', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Music commands require you to be in a voice channel' });
                    
            case 'controls':
                return new EmbedBuilder()
                    .setTitle('🎛️ Control Commands')
                    .setColor('#FF0088')
                    .setDescription('Commands for controlling the music player')
                    .addFields(
                        { 
                            name: '`/nowplaying`', 
                            value: 'Show information about the currently playing song with interactive controls.', 
                            inline: false 
                        },
                        { 
                            name: '`/queue`', 
                            value: 'View the current queue with pagination controls.', 
                            inline: false 
                        },
                        { 
                            name: '`/volume [level]`', 
                            value: 'Change the playback volume (0-100).\nExample: `/volume 50`', 
                            inline: false 
                        },
                        { 
                            name: '`/seek [time]`', 
                            value: 'Seek to a specific position in the current song.\nExample: `/seek 1:30`', 
                            inline: false 
                        },
                        { 
                            name: '`/loop [mode]`', 
                            value: 'Set loop mode (off, song, queue).\nExample: `/loop song`', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Control commands require an active music session' });
                    
            case 'settings':
                return new EmbedBuilder()
                    .setTitle('⚙️ Settings Commands')
                    .setColor('#FF0088')
                    .setDescription('Commands for configuring the music bot')
                    .addFields(
                        { 
                            name: '`/settings`', 
                            value: 'View and adjust bot settings through an interactive menu.', 
                            inline: false 
                        },
                        { 
                            name: '`/dj [role]`', 
                            value: 'Set or view the DJ role for restricted commands.\nExample: `/dj @DJ`', 
                            inline: false 
                        },
                        { 
                            name: '`/language [code]`', 
                            value: 'Set the bot language for your server.\nExample: `/language en`', 
                            inline: false 
                        },
                        { 
                            name: '`/autoplay [on/off]`', 
                            value: 'Toggle autoplay when queue ends.\nExample: `/autoplay on`', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Settings commands require server management permissions' });
                    
            case 'playlists':
                return new EmbedBuilder()
                    .setTitle('📋 Playlist Commands')
                    .setColor('#FF0088')
                    .setDescription('Commands for managing music playlists')
                    .addFields(
                        { 
                            name: '`/playlist [action]`', 
                            value: 'Manage playlists with various subcommands.\nExample: `/playlist create MyPlaylist`', 
                            inline: false 
                        },
                        { 
                            name: '`/save [name]`', 
                            value: 'Save the current queue as a playlist.\nExample: `/save RoadTrip`', 
                            inline: false 
                        },
                        { 
                            name: '`/load [name]`', 
                            value: 'Load a saved playlist into the queue.\nExample: `/load PartyMix`', 
                            inline: false 
                        },
                        { 
                            name: '`/delete [name]`', 
                            value: 'Delete a saved playlist.\nExample: `/delete OldPlaylist`', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Playlist commands save your favorite music collections' });
                    
            case 'stats':
                return new EmbedBuilder()
                    .setTitle('📊 Statistics Commands')
                    .setColor('#FF0088')
                    .setDescription('Commands for viewing bot statistics and information')
                    .addFields(
                        { 
                            name: '`/stats`', 
                            value: 'View bot statistics like servers, users, and active players.', 
                            inline: false 
                        },
                        { 
                            name: '`/ping`', 
                            value: 'Check the bot\'s latency and response time.', 
                            inline: false 
                        },
                        { 
                            name: '`/uptime`', 
                            value: 'View how long the bot has been online.', 
                            inline: false 
                        },
                        { 
                            name: '`/info`', 
                            value: 'Show detailed information about the bot, including version and links.', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Statistics commands show bot performance metrics' });
                    
            default:
                return new EmbedBuilder()
                    .setTitle('❓ Unknown Category')
                    .setColor('#FF0088')
                    .setDescription('The selected category was not found. Please use one of the available categories.')
                    .addFields(
                        { name: 'Available Categories', value: '`music`, `controls`, `settings`, `playlists`, `stats`', inline: false }
                    )
                    .setFooter({ text: 'Use /help for the main help menu' });
        }
    }
};