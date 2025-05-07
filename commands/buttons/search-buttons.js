// Search results button handler
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embed');

module.exports = {
    customId: 'search',
    
    async execute(interaction, client) {
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in a voice channel to select songs!')],
                ephemeral: true 
            });
        }
        
        // Get the action from custom ID (e.g., 'search:1')
        const [_, index] = interaction.customId.split(':');
        
        // Get the search results from client storage
        if (!client.searchResults || !client.searchResults.get(interaction.user.id)) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'Your search session has expired. Please search again.')],
                ephemeral: true 
            });
        }
        
        const userData = client.searchResults.get(interaction.user.id);
        const { results } = userData;
        
        if (index === 'cancel') {
            // User cancelled the search
            await interaction.update({ 
                embeds: [createSuccessEmbed('Search Cancelled', 'The search operation was cancelled.')],
                components: [] 
            });
            client.searchResults.delete(interaction.user.id);
            return;
        }
        
        try {
            if (index === 'all') {
                // User wants to play all songs
                await interaction.deferUpdate();
                
                // Convert all search results to song objects
                const songs = results.map(result => ({
                    title: result.title,
                    url: result.url,
                    duration: result.durationRaw,
                    durationInSeconds: result.durationInSec,
                    thumbnail: result.thumbnails[0].url,
                    requestedBy: interaction.user.tag,
                    channelName: result.channel.name,
                    source: 'youtube'
                }));
                
                // Add the first song to start playing
                const firstSong = songs.shift();
                const result = await client.player.play(interaction, firstSong);
                
                if (result.success) {
                    // If there are more songs, add them to the queue
                    if (songs.length > 0) {
                        // Get the queue
                        const queue = client.player.getQueue(interaction.guildId);
                        queue.addSongs(songs);
                        
                        // Update the message
                        await interaction.editReply({ 
                            embeds: [createSuccessEmbed(
                                '▶️ Playlist Added',
                                `Added **${results.length}** songs to the queue!`
                            )],
                            components: [] 
                        });
                    } else {
                        // Just one song
                        const songEmbed = createSuccessEmbed(
                            '▶️ Now Playing',
                            `[${firstSong.title}](${firstSong.url})`
                        );
                        songEmbed.addFields(
                            { name: '⏱️ Duration', value: firstSong.duration, inline: true },
                            { name: '👤 Requested by', value: firstSong.requestedBy, inline: true },
                            { name: '📻 Channel', value: firstSong.channelName || 'Unknown', inline: true }
                        );
                        
                        await interaction.editReply({ 
                            embeds: [songEmbed],
                            components: [] 
                        });
                    }
                } else {
                    await interaction.editReply({ 
                        embeds: [createErrorEmbed('Error', result.message)],
                        components: [] 
                    });
                }
            } else {
                // User selected a specific song
                const songIndex = parseInt(index);
                if (isNaN(songIndex) || songIndex < 0 || songIndex >= results.length) {
                    await interaction.reply({ 
                        content: "Invalid selection. Please try again.",
                        ephemeral: true 
                    });
                    return;
                }
                
                await interaction.deferUpdate();
                
                const selectedResult = results[songIndex];
                
                const song = {
                    title: selectedResult.title,
                    url: selectedResult.url,
                    duration: selectedResult.durationRaw,
                    durationInSeconds: selectedResult.durationInSec,
                    thumbnail: selectedResult.thumbnails[0].url,
                    requestedBy: interaction.user.tag,
                    channelName: selectedResult.channel.name,
                    source: 'youtube'
                };
                
                const result = await client.player.play(interaction, song);
                
                if (result.success) {
                    const songEmbed = createSuccessEmbed(
                        result.position === 0 ? '▶️ Now Playing' : '🎵 Added to Queue',
                        `[${song.title}](${song.url})`
                    );
                    songEmbed.addFields(
                        { name: '⏱️ Duration', value: song.duration, inline: true },
                        { 
                            name: '📌 Position', 
                            value: result.position === 0 ? 'Now Playing' : `#${result.position + 1} in queue`, 
                            inline: true 
                        },
                        { name: '👤 Requested by', value: song.requestedBy, inline: true },
                        { name: '📻 Channel', value: song.channelName || 'Unknown', inline: true }
                    );
                    
                    await interaction.editReply({ 
                        embeds: [songEmbed],
                        components: [] 
                    });
                } else {
                    await interaction.editReply({ 
                        embeds: [createErrorEmbed('Error', result.message)],
                        components: [] 
                    });
                }
            }
            
            // Clean up
            client.searchResults.delete(interaction.user.id);
        } catch (error) {
            console.error('Error in search button handler:', error);
            await interaction.followUp({ 
                embeds: [createErrorEmbed('Error', `An error occurred: ${error.message}`)],
                ephemeral: true 
            });
            
            // Clean up
            client.searchResults.delete(interaction.user.id);
        }
    }
};