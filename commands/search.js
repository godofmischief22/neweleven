const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const play = require('play-dl');
const { createEmbed, createErrorEmbed } = require('../utils/embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for songs on YouTube')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('What song would you like to search for?')
                .setRequired(true)),
    
    async execute(interaction, client) {
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Error', 'You need to be in a voice channel to search for songs!')],
                ephemeral: true 
            });
        }
        
        // Defer reply as this might take some time
        await interaction.deferReply();
        
        try {
            const query = interaction.options.getString('query');
            
            // Search for songs
            const searchResults = await play.search(query, { limit: 5 });
            
            if (searchResults.length === 0) {
                return interaction.followUp({ 
                    embeds: [createErrorEmbed('Error', 'No results found for your search query!')],
                    ephemeral: true 
                });
            }
            
            // Create an embed with search results
            const searchEmbed = new EmbedBuilder()
                .setTitle('🔍 Search Results')
                .setDescription(`Here are the results for: **${query}**`)
                .setColor('#FF0088');
            
            // Add each result as a field
            searchResults.forEach((result, index) => {
                const duration = result.durationRaw;
                const views = formatNumber(result.views);
                
                searchEmbed.addFields({
                    name: `${index + 1}. ${result.title.length > 60 ? result.title.substring(0, 57) + '...' : result.title}`,
                    value: `Duration: **${duration}** | Views: **${views}** | Channel: **${result.channel.name}**`
                });
            });
            
            // Add footer
            searchEmbed.setFooter({ 
                text: 'Click a button below to select a song, or click "Play All" to add all songs to the queue'
            });
            
            // Create buttons for selection
            const buttons = [];
            
            // Add number buttons (1-5)
            const numberRow = new ActionRowBuilder();
            for (let i = 1; i <= Math.min(5, searchResults.length); i++) {
                numberRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`search:${i - 1}`)
                        .setLabel(`${i}`)
                        .setStyle(ButtonStyle.Primary)
                );
            }
            buttons.push(numberRow);
            
            // Add Play All button in a separate row
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('search:all')
                        .setLabel('Play All')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('▶️'),
                    new ButtonBuilder()
                        .setCustomId('search:cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('❌')
                );
            buttons.push(actionRow);
            
            // Store search results in a Map linked to the user's ID for retrieval when they click a button
            if (!client.searchResults) {
                client.searchResults = new Map();
            }
            client.searchResults.set(interaction.user.id, {
                results: searchResults,
                timestamp: Date.now(),
                channelId: interaction.channelId,
                guildId: interaction.guildId,
                member: interaction.member
            });
            
            // Send the search results with selection buttons
            await interaction.followUp({ 
                embeds: [searchEmbed],
                components: buttons
            });
            
            // The button event handlers in search-buttons.js will handle user selections
        } catch (error) {
            console.error('Error in search command:', error);
            return interaction.followUp({ 
                embeds: [createErrorEmbed('Error', `Something went wrong: ${error.message}`)]
            });
        }
    }
};

// Helper function to format duration
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Helper function to format large numbers
function formatNumber(num) {
    if (!num) return '0';
    
    if (num >= 1000000) {
        return `${Math.floor(num / 1000000)}M`;
    } else if (num >= 1000) {
        return `${Math.floor(num / 1000)}K`;
    } else {
        return num.toString();
    }
}