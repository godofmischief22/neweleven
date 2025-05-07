const { SlashCommandBuilder } = require('discord.js');
const { createPlayer } = require('../utils/player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjusts or shows the volume')
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(100)),
    
    async execute(interaction, client) {
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in a voice channel to use this command!')],
                ephemeral: true 
            });
        }
        
        // Check if the bot is in the same voice channel
        if (interaction.guild.members.me.voice.channel && 
            interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in the same voice channel as me to use this command!')],
                ephemeral: true 
            });
        }
        
        const player = createPlayer(client);
        const volumeLevel = interaction.options.getInteger('level');
        
        // If no volume level is provided, display current volume
        if (volumeLevel === null) {
            const nowPlaying = player.getNowPlaying(interaction.guildId);
            
            if (!nowPlaying.success) {
                return interaction.reply({ 
                    embeds: [createErrorEmbed('Error', nowPlaying.message)],
                    ephemeral: true 
                });
            }
            
            return interaction.reply({ 
                embeds: [createSuccessEmbed('Current Volume', `The current volume is set to **${nowPlaying.volume}%**`)]
            });
        }
        
        // Set the volume
        const result = player.setVolume(interaction.guildId, volumeLevel);
        
        if (result.success) {
            return interaction.reply({ 
                embeds: [createSuccessEmbed('Volume Adjusted', `Volume has been set to **${volumeLevel}%**`)]
            });
        } else {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', result.message)],
                ephemeral: true 
            });
        }
    }
};
