const { SlashCommandBuilder } = require('discord.js');
const { createPlayer } = require('../utils/player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the currently playing song'),
    
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
        const result = player.pause(interaction.guildId);
        
        if (result.success) {
            return interaction.reply({ 
                embeds: [createSuccessEmbed('Paused', 'The music has been paused. Use `/resume` to continue playing!')]
            });
        } else {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', result.message)],
                ephemeral: true 
            });
        }
    }
};
