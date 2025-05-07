// Help menu button handler
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'help',
    
    async execute(interaction, client) {
        // Get the category from the button ID
        const [_, category] = interaction.customId.split(':');
        
        if (category === 'support') {
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
                
            await interaction.update({ embeds: [supportEmbed], components: [] });
        } else {
            // Display a category
            const embed = getCategoryEmbed(category);
            await interaction.update({ embeds: [embed], components: [] });
        }
    }
};

function getCategoryEmbed(category) {
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