// Queue pagination button handler
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createQueueEmbed, createErrorEmbed, createEmbed } = require('../../utils/embed');
const config = require('../../config');

module.exports = {
    customId: 'queue',
    
    async execute(interaction, client) {
        // Get the action from the button
        const [_, action] = interaction.customId.split(':');
        
        // Get queue data
        const result = client.player.getQueueList(interaction.guildId);
        
        if (!result.success) {
            return interaction.update({ 
                embeds: [createErrorEmbed('Queue Error', result.message)],
                components: [] 
            });
        }
        
        const { current, songs, playing } = result;
        
        // Pagination settings
        const songsPerPage = 10;
        const pageCount = Math.ceil(songs.length / songsPerPage);
        
        // Get current page from button label or default to 1
        let currentPage = 1;
        try {
            const pageBtn = interaction.message.components[0].components.find(c => c.customId === 'queue:refresh');
            if (pageBtn) {
                const pageInfo = pageBtn.label.split('/');
                currentPage = parseInt(pageInfo[0]);
            }
        } catch (error) {
            console.error('Error getting current page:', error);
        }
        
        let page = currentPage;
        
        // Handle different actions
        switch (action) {
            case 'first':
                page = 1;
                break;
                
            case 'prev':
                page = Math.max(1, currentPage - 1);
                break;
                
            case 'next':
                page = Math.min(pageCount, currentPage + 1);
                break;
                
            case 'last':
                page = pageCount;
                break;
                
            case 'refresh':
                // Just refresh with current page
                break;
                
            case 'clear':
                // Clear the queue but keep the current song
                if (!current) {
                    return interaction.update({ 
                        embeds: [createErrorEmbed('Error', 'The queue is already empty!')],
                        components: [] 
                    });
                }
                
                // Empty the queue in the player
                const queue = client.player.getQueue(interaction.guildId);
                queue.clear();
                
                return interaction.update({ 
                    embeds: [createEmbed({
                        title: '🗑️ Queue Cleared',
                        description: 'The queue has been cleared. The current song will continue playing.',
                        color: config.style?.colors?.success || '#2ECC71'
                    })],
                    components: [] 
                });
                
            case 'shuffle':
                // Shuffle the queue
                if (songs.length < 2) {
                    return interaction.update({ 
                        embeds: [createErrorEmbed('Error', 'Need at least 2 songs in the queue to shuffle!')],
                        components: [] 
                    });
                }
                
                // Get the queue and shuffle it
                const queueToShuffle = client.player.getQueue(interaction.guildId);
                
                // Perform shuffle (this depends on your implementation)
                // Here's a simple in-place shuffle implementation
                const songsToShuffle = queueToShuffle.getSongs();
                for (let i = songsToShuffle.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [songsToShuffle[i], songsToShuffle[j]] = [songsToShuffle[j], songsToShuffle[i]];
                }
                
                return interaction.update({ 
                    embeds: [createEmbed({
                        title: '🔀 Queue Shuffled',
                        description: 'The queue has been shuffled!',
                        color: config.style?.colors?.success || '#2ECC71'
                    })],
                    components: [] 
                });
        }
        
        // Determine which songs to display on this page
        const startIdx = (page - 1) * songsPerPage;
        const endIdx = Math.min(startIdx + songsPerPage, songs.length);
        const songsToDisplay = songs.slice(startIdx, endIdx);
        
        // Create a new embed with the updated data
        const embed = createQueueEmbed(songsToDisplay, current, page, pageCount);
        
        // Update the buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('queue:first')
                    .setLabel('First')
                    .setEmoji('⏮️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 1),
                    
                new ButtonBuilder()
                    .setCustomId('queue:prev')
                    .setLabel('Previous')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),
                    
                new ButtonBuilder()
                    .setCustomId('queue:refresh')
                    .setLabel(`${page}/${pageCount}`)
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Secondary),
                    
                new ButtonBuilder()
                    .setCustomId('queue:next')
                    .setLabel('Next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pageCount || pageCount === 0),
                    
                new ButtonBuilder()
                    .setCustomId('queue:last')
                    .setLabel('Last')
                    .setEmoji('⏭️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === pageCount || pageCount === 0)
            );
            
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('queue:clear')
                    .setLabel('Clear Queue')
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Danger),
                    
                new ButtonBuilder()
                    .setCustomId('queue:shuffle')
                    .setLabel('Shuffle')
                    .setEmoji('🔀')
                    .setStyle(ButtonStyle.Success)
            );
        
        // Update the message
        await interaction.update({ 
            embeds: [embed], 
            components: [row, controlRow] 
        });
    }
};