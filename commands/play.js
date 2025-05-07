const { SlashCommandBuilder } = require('discord.js');
const play = require('play-dl');
const { createPlayer } = require('../utils/player');
const { createEmbed, createErrorEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The song URL or search query')
                .setRequired(true)),
    
    async execute(interaction, client) {
        // Defer reply as this might take some time
        await interaction.deferReply();
        
        // Check if user is in a voice channel
        const member = interaction.member;
        if (!member.voice.channel) {
            return interaction.followUp({ 
                embeds: [createErrorEmbed('Error', 'You need to join a voice channel first!')] 
            });
        }
        
        // Check if bot has permission to join and speak
        const permissions = member.voice.channel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.followUp({ 
                embeds: [createErrorEmbed('Error', 'I need permissions to join and speak in your voice channel!')] 
            });
        }
        
        try {
            const query = interaction.options.getString('query');
            let songInfo;
            
            // Check if the query is a URL
            if (play.yt_validate(query) === 'video') {
                // It's a YouTube video URL
                const videoInfo = await play.video_info(query);
                songInfo = {
                    title: videoInfo.video_details.title,
                    url: videoInfo.video_details.url,
                    duration: formatDuration(videoInfo.video_details.durationInSec),
                    thumbnail: videoInfo.video_details.thumbnails[0].url,
                    requestedBy: interaction.user.tag,
                    source: 'youtube'
                };
            } else if (play.yt_validate(query) === 'playlist') {
                // It's a YouTube playlist URL
                const playlistInfo = await play.playlist_info(query, { incomplete: true });
                const videos = await playlistInfo.all_videos();
                
                const songs = videos.map(video => ({
                    title: video.title,
                    url: video.url,
                    duration: formatDuration(video.durationInSec),
                    thumbnail: video.thumbnails[0].url,
                    requestedBy: interaction.user.tag,
                    source: 'youtube'
                }));
                
                const player = createPlayer(client);
                const queue = player.getQueue(interaction.guildId);
                const startPosition = queue.length;
                
                // Add all songs to the queue
                queue.addSongs(songs);
                
                // Start playing if not already playing
                if (!queue.playing) {
                    const result = await player.play(interaction);
                    
                    return interaction.followUp({
                        embeds: [createEmbed({
                            title: 'Playlist Added',
                            description: `Added **${songs.length}** songs from [${playlistInfo.title}](${playlistInfo.url})`,
                            color: '#5865F2',
                            thumbnail: playlistInfo.thumbnail.url,
                            fields: [
                                { name: 'Requested by', value: interaction.user.tag, inline: true },
                                { name: 'Position', value: startPosition > 0 ? `Starting at position ${startPosition + 1}` : 'Playing now', inline: true }
                            ]
                        })]
                    });
                } else {
                    return interaction.followUp({
                        embeds: [createEmbed({
                            title: 'Playlist Added',
                            description: `Added **${songs.length}** songs from [${playlistInfo.title}](${playlistInfo.url})`,
                            color: '#5865F2',
                            thumbnail: playlistInfo.thumbnail.url,
                            fields: [
                                { name: 'Requested by', value: interaction.user.tag, inline: true },
                                { name: 'Position', value: `Starting at position ${startPosition + 1}`, inline: true }
                            ]
                        })]
                    });
                }
            } else {
                // It's a search query
                const searchResult = await play.search(query, { limit: 1 });
                
                if (searchResult.length === 0) {
                    return interaction.followUp({ 
                        embeds: [createErrorEmbed('Error', 'No results found for your search query!')] 
                    });
                }
                
                const video = searchResult[0];
                songInfo = {
                    title: video.title,
                    url: video.url,
                    duration: formatDuration(video.durationInSec),
                    thumbnail: video.thumbnails[0].url,
                    requestedBy: interaction.user.tag,
                    source: 'youtube'
                };
            }
            
            // Create player and play the song
            const player = createPlayer(client);
            const result = await player.play(interaction, songInfo);
            
            if (result.success) {
                // Check if the song is being played immediately or queued
                if (result.position === 0) {
                    // Song is playing now, the now playing message will be sent by the player
                    return interaction.followUp({ content: 'Starting playback...' });
                } else {
                    // Song is queued
                    return interaction.followUp({
                        embeds: [createEmbed({
                            title: 'Added to Queue',
                            description: `[${songInfo.title}](${songInfo.url})`,
                            color: '#5865F2',
                            thumbnail: songInfo.thumbnail,
                            fields: [
                                { name: 'Duration', value: songInfo.duration, inline: true },
                                { name: 'Requested by', value: interaction.user.tag, inline: true },
                                { name: 'Position', value: `${result.position + 1}`, inline: true }
                            ]
                        })]
                    });
                }
            } else {
                return interaction.followUp({ 
                    embeds: [createErrorEmbed('Error', result.message)] 
                });
            }
        } catch (error) {
            console.error('Error in play command:', error);
            return interaction.followUp({ 
                embeds: [createErrorEmbed('Error', `Something went wrong: ${error.message}`)] 
            });
        }
    }
};

// Helper function to format duration in seconds to mm:ss format
function formatDuration(durationInSeconds) {
    if (!durationInSeconds) return 'Unknown';
    
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
