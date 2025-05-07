const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, createErrorEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows information about the currently playing song with playback controls'),
    
    async execute(interaction, client) {
        const result = client.player.getNowPlaying(interaction.guildId);
        
        if (!result.success) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', result.message)],
                ephemeral: true 
            });
        }
        
        const { song, playing, volume } = result;
        
        // Create embed with song information
        const embed = this.createNowPlayingEmbed(song, playing, volume);
        
        // Create control buttons
        const rows = this.createControlButtons(playing);
        
        // Send the message with embed and buttons
        return interaction.reply({ 
            embeds: [embed],
            components: rows
        });
    },
    
    // Create the Now Playing embed with enhanced visuals
    createNowPlayingEmbed(song, playing, volume) {
        // Calculate volume icon based on volume level
        let volumeIcon = '🔈';
        if (volume > 50) {
            volumeIcon = '🔊';
        } else if (volume > 0) {
            volumeIcon = '🔉';
        } else {
            volumeIcon = '🔇';
        }
        
        // Create a visual representation of the playback progress (if duration is available)
        let progressBar = '';
        const progressEmojis = {
            start: '▁',  // Start of the track
            playing: '█', // Current position
            empty: '▬',   // Remaining track
            end: '▄'      // End of track
        };
        
        // Generate a simple progress bar (10 segments)
        if (song.duration && song.currentTime) {
            const durationInSeconds = this.convertToSeconds(song.duration);
            const currentTimeInSeconds = this.convertToSeconds(song.currentTime);
            
            if (durationInSeconds > 0) {
                const percentage = Math.min(currentTimeInSeconds / durationInSeconds, 1);
                const position = Math.floor(percentage * 8);
                
                for (let i = 0; i < 10; i++) {
                    if (i === 0) {
                        progressBar += progressEmojis.start;
                    } else if (i === 9) {
                        progressBar += progressEmojis.end;
                    } else if (i === position) {
                        progressBar += progressEmojis.playing;
                    } else {
                        progressBar += progressEmojis.empty;
                    }
                }
                
                progressBar += ` \`${song.currentTime} / ${song.duration}\``;
            }
        }
        
        // If no progress bar could be created, use a placeholder
        if (!progressBar) {
            progressBar = `\`${song.duration || 'Unknown duration'}\``;
        }
        
        return createEmbed({
            title: '🎸 Now Playing Music',
            description: `### [${song.title}](${song.url})\n\n${progressBar}`,
            color: '#FF0088', // Pink color like "Lara Music"
            image: song.thumbnail, // Use full-size image instead of thumbnail
            fields: [
                { name: '👤 Requested by', value: song.requestedBy || 'Unknown', inline: true },
                { name: `${volumeIcon} Volume`, value: `${volume}%`, inline: true },
                { name: '🎛️ Status', value: playing ? '▶️ Playing' : '⏸️ Paused', inline: true },
                { name: '📻 Channel', value: song.channelName || 'Unknown', inline: true }
            ],
            author: { 
                name: 'Music Player',
                icon_url: 'https://i.imgur.com/nLxZJLd.png' // Music note icon
            },
            footer: {
                text: '✨ High quality music. Use the buttons below to control playback'
            },
            timestamp: Date.now()
        });
    },
    
    // Helper function to convert duration strings (e.g. "3:45") to seconds
    convertToSeconds(timeString) {
        if (!timeString) return 0;
        
        const parts = timeString.split(':').map(part => parseInt(part, 10));
        
        if (parts.length === 3) { // hours:minutes:seconds
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) { // minutes:seconds
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) { // seconds only
            return parts[0];
        }
        
        return 0;
    },
    
    // Create control buttons
    createControlButtons(playing) {
        // First row: Playback control buttons
        const playbackRow = new ActionRowBuilder()
            .addComponents(
                // Play/Pause button
                new ButtonBuilder()
                    .setCustomId(playing ? 'playback-control:pause' : 'playback-control:resume')
                    .setEmoji(playing ? '⏸️' : '▶️')
                    .setLabel(playing ? 'Pause' : 'Resume')
                    .setStyle(playing ? ButtonStyle.Secondary : ButtonStyle.Success),
                
                // Skip button
                new ButtonBuilder()
                    .setCustomId('playback-control:skip')
                    .setEmoji('⏭️')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary),
                    
                // Stop button
                new ButtonBuilder()
                    .setCustomId('playback-control:stop')
                    .setEmoji('⏹️')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger),
                    
                // Refresh button
                new ButtonBuilder()
                    .setCustomId('playback-control:refresh')
                    .setEmoji('🔄')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
            );
            
        // Second row: Volume control buttons
        const volumeRow = new ActionRowBuilder()
            .addComponents(
                // Volume down button
                new ButtonBuilder()
                    .setCustomId('volume-control:down')
                    .setEmoji('🔉')
                    .setLabel('Volume -')
                    .setStyle(ButtonStyle.Secondary),
                    
                // Mute/Unmute button
                new ButtonBuilder()
                    .setCustomId('volume-control:mute')
                    .setEmoji('🔇')
                    .setLabel('Mute/Unmute')
                    .setStyle(ButtonStyle.Secondary),
                    
                // Volume up button
                new ButtonBuilder()
                    .setCustomId('volume-control:up')
                    .setEmoji('🔊')
                    .setLabel('Volume +')
                    .setStyle(ButtonStyle.Secondary)
            );
            
        return [playbackRow, volumeRow];
    }
};
