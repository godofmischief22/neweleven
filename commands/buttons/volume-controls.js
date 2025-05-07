// Volume controls button handler
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embed');

module.exports = {
    customId: 'volume-control',
    
    async execute(interaction, client) {
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in a voice channel to adjust volume!')],
                ephemeral: true 
            });
        }
        
        // Check if the bot is in the same voice channel
        if (interaction.guild.members.me.voice.channel && 
            interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in the same voice channel as me to adjust volume!')],
                ephemeral: true 
            });
        }
        
        // Get the volume action from custom ID (e.g., 'volume-control:up')
        const [_, action] = interaction.customId.split(':');
        
        // Get current volume
        const nowPlaying = client.player.getNowPlaying(interaction.guildId);
        
        if (!nowPlaying.success) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', nowPlaying.message)],
                ephemeral: true 
            });
        }
        
        let newVolume = nowPlaying.volume;
        
        // Handle different volume actions
        switch (action) {
            case 'down':
                // Decrease volume by 10, minimum 0
                newVolume = Math.max(0, nowPlaying.volume - 10);
                break;
                
            case 'up':
                // Increase volume by 10, maximum 100
                newVolume = Math.min(100, nowPlaying.volume + 10);
                break;
                
            case 'mute':
                // Toggle mute (0 or 50)
                newVolume = nowPlaying.volume > 0 ? 0 : 50;
                break;
                
            default:
                return interaction.reply({ 
                    embeds: [createErrorEmbed('Error', 'Unknown volume action!')],
                    ephemeral: true 
                });
        }
        
        // Set the new volume
        const result = client.player.setVolume(interaction.guildId, newVolume);
        
        if (result.success) {
            // Get updated now playing info
            const updatedNowPlaying = client.player.getNowPlaying(interaction.guildId);
            
            if (updatedNowPlaying.success) {
                // Update the message with new volume info
                const embed = require('../nowplaying').createNowPlayingEmbed(
                    updatedNowPlaying.song, 
                    updatedNowPlaying.playing, 
                    updatedNowPlaying.volume
                );
                
                await interaction.update({ 
                    embeds: [embed],
                    components: require('../nowplaying').createControlButtons(updatedNowPlaying.playing) 
                });
            } else {
                // Just acknowledge the volume change
                await interaction.reply({ 
                    embeds: [createSuccessEmbed('Volume Adjusted', `Volume has been set to **${newVolume}%**`)],
                    ephemeral: true 
                });
            }
        } else {
            await interaction.reply({ 
                embeds: [createErrorEmbed('Error', result.message)],
                ephemeral: true 
            });
        }
    }
};