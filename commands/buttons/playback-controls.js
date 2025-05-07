// Playback controls button handler
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embed');

module.exports = {
    customId: 'playback-control',
    
    async execute(interaction, client) {
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in a voice channel to use these controls!')],
                ephemeral: true 
            });
        }
        
        // Check if the bot is in the same voice channel
        if (interaction.guild.members.me.voice.channel && 
            interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in the same voice channel as me to use these controls!')],
                ephemeral: true 
            });
        }
        
        // Get the action from custom ID (e.g., 'playback-control:pause')
        const [_, action] = interaction.customId.split(':');
        
        // Handle different actions
        switch (action) {
            case 'pause':
                return handlePause(interaction, client);
            
            case 'resume':
                return handleResume(interaction, client);
                
            case 'skip':
                return handleSkip(interaction, client);
                
            case 'stop':
                return handleStop(interaction, client);
                
            case 'refresh':
                return handleRefresh(interaction, client);
                
            default:
                return interaction.reply({ 
                    embeds: [createErrorEmbed('Error', 'Unknown control action!')],
                    ephemeral: true 
                });
        }
    }
};

// Function to handle pause action
async function handlePause(interaction, client) {
    const result = client.player.pause(interaction.guildId);
    
    if (result.success) {
        await interaction.update({ 
            components: require('../nowplaying').createControlButtons(false) 
        });
    } else {
        await interaction.reply({ 
            embeds: [createErrorEmbed('Error', result.message)],
            ephemeral: true 
        });
    }
}

// Function to handle resume action
async function handleResume(interaction, client) {
    const result = client.player.resume(interaction.guildId);
    
    if (result.success) {
        await interaction.update({ 
            components: require('../nowplaying').createControlButtons(true) 
        });
    } else {
        await interaction.reply({ 
            embeds: [createErrorEmbed('Error', result.message)],
            ephemeral: true 
        });
    }
}

// Function to handle skip action
async function handleSkip(interaction, client) {
    const result = client.player.skip(interaction.guildId);
    
    if (result.success) {
        // Get updated now playing info
        const nowPlaying = client.player.getNowPlaying(interaction.guildId);
        
        if (nowPlaying.success) {
            // Update the message with new song info
            const embed = require('../nowplaying').createNowPlayingEmbed(nowPlaying.song, nowPlaying.playing, nowPlaying.volume);
            await interaction.update({ 
                embeds: [embed],
                components: require('../nowplaying').createControlButtons(nowPlaying.playing) 
            });
        } else {
            // If no more songs, just acknowledge the skip
            await interaction.reply({ 
                embeds: [createSuccessEmbed('Skipped', result.message)],
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

// Function to handle stop action
async function handleStop(interaction, client) {
    const result = client.player.stop(interaction.guildId);
    
    if (result.success) {
        // Clear the music controller
        await interaction.update({ 
            embeds: [createSuccessEmbed('Stopped', 'Music playback has been stopped and the queue has been cleared.')],
            components: [] 
        });
    } else {
        await interaction.reply({ 
            embeds: [createErrorEmbed('Error', result.message)],
            ephemeral: true 
        });
    }
}

// Function to handle refresh action
async function handleRefresh(interaction, client) {
    const nowPlaying = client.player.getNowPlaying(interaction.guildId);
    
    if (nowPlaying.success) {
        const embed = require('../nowplaying').createNowPlayingEmbed(nowPlaying.song, nowPlaying.playing, nowPlaying.volume);
        await interaction.update({ 
            embeds: [embed],
            components: require('../nowplaying').createControlButtons(nowPlaying.playing) 
        });
    } else {
        await interaction.reply({ 
            embeds: [createErrorEmbed('Error', nowPlaying.message)],
            ephemeral: true 
        });
    }
}