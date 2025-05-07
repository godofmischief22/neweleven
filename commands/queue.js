const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createQueueEmbed, createErrorEmbed, createEmbed } = require('../utils/embed');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue with pagination controls')
        .addIntegerOption(option => 
            option.setName('page')
                .setDescription('The page number to view')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const result = client.player.getQueueList(interaction.guildId);
        
        if (!result.success) {
            return interaction.reply({ 
                embeds: [createErrorEmbed('Queue Empty', result.message)],
                ephemeral: true 
            });
        }
        
        const { current, songs, playing } = result;
        
        if (!current && songs.length === 0) {
            return interaction.reply({ 
                embeds: [createEmbed({
                    title: '📋 Queue',
                    description: '### The queue is empty\n\nAdd some songs with `/play` or `/search` command!',
                    color: config.style?.colors?.primary || '#FF0088',
                    footer: { text: 'Use /play to add songs to the queue' }
                })]
            });
        }
        
        // Pagination
        const songsPerPage = 10;
        const pageCount = Math.ceil(songs.length / songsPerPage);
        let page = interaction.options.getInteger('page') || 1;
        
        // Validate page number
        if (page < 1) page = 1;
        if (page > pageCount) page = pageCount;
        
        // Determine which songs to display on this page
        const startIdx = (page - 1) * songsPerPage;
        const endIdx = Math.min(startIdx + songsPerPage, songs.length);
        const songsToDisplay = songs.slice(startIdx, endIdx);
        
        // Create queue embed with new helper function
        const embed = createQueueEmbed(songsToDisplay, current, page, pageCount);
        
        // Only add pagination buttons if there's more than one page
        if (pageCount > 1) {
            // Create buttons for pagination
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
                        .setDisabled(page === pageCount),
                        
                    new ButtonBuilder()
                        .setCustomId('queue:last')
                        .setLabel('Last')
                        .setEmoji('⏭️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === pageCount)
                );
                
            // Additional buttons (optional)
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
            
            const response = await interaction.reply({ 
                embeds: [embed], 
                components: [row, controlRow],
                fetchReply: true 
            });
            
            // Create a collector for the buttons
            const collector = response.createMessageComponentCollector({ 
                time: 60000 // 1 minute timeout
            });
            
            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({ 
                        content: "You cannot use these buttons as you didn't trigger this command!", 
                        ephemeral: true 
                    });
                    return;
                }
                
                // Get the action from the button
                const [_, action] = buttonInteraction.customId.split(':');
                
                // Get fresh queue data
                const updatedResult = client.player.getQueueList(interaction.guildId);
                
                if (!updatedResult.success) {
                    await buttonInteraction.update({ 
                        embeds: [createErrorEmbed('Queue Error', updatedResult.message)],
                        components: [] 
                    });
                    return;
                }
                
                const { current: updatedCurrent, songs: updatedSongs, playing: updatedPlaying } = updatedResult;
                const updatedPageCount = Math.ceil(updatedSongs.length / songsPerPage);
                let updatedPage = page;
                
                // Handle different actions
                switch (action) {
                    case 'first':
                        updatedPage = 1;
                        break;
                        
                    case 'prev':
                        updatedPage = Math.max(1, page - 1);
                        break;
                        
                    case 'next':
                        updatedPage = Math.min(updatedPageCount, page + 1);
                        break;
                        
                    case 'last':
                        updatedPage = updatedPageCount;
                        break;
                        
                    case 'refresh':
                        // Just refresh with current page
                        break;
                        
                    case 'clear':
                        // Clear the queue
                        if (!updatedCurrent) {
                            await buttonInteraction.update({ 
                                embeds: [createErrorEmbed('Error', 'The queue is already empty!')],
                                components: [] 
                            });
                            return;
                        }
                        
                        // Clear the queue but keep the current song
                        updatedResult.songs = [];
                        updatedPage = 1;
                        
                        await buttonInteraction.update({ 
                            embeds: [createEmbed({
                                title: '🗑️ Queue Cleared',
                                description: 'The queue has been cleared. The current song will continue playing.',
                                color: config.style?.colors?.success || '#2ECC71'
                            })],
                            components: [] 
                        });
                        return;
                        
                    case 'shuffle':
                        // Shuffle the queue
                        if (updatedSongs.length < 2) {
                            await buttonInteraction.update({ 
                                embeds: [createErrorEmbed('Error', 'Need at least 2 songs in the queue to shuffle!')],
                                components: [] 
                            });
                            return;
                        }
                        
                        // Fisher-Yates shuffle algorithm
                        for (let i = updatedSongs.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [updatedSongs[i], updatedSongs[j]] = [updatedSongs[j], updatedSongs[i]];
                        }
                        
                        await buttonInteraction.update({ 
                            embeds: [createEmbed({
                                title: '🔀 Queue Shuffled',
                                description: 'The queue has been shuffled!',
                                color: config.style?.colors?.success || '#2ECC71'
                            })],
                            components: [] 
                        });
                        return;
                }
                
                // Update the page number
                page = updatedPage;
                
                // Determine which songs to display on this page
                const updatedStartIdx = (updatedPage - 1) * songsPerPage;
                const updatedEndIdx = Math.min(updatedStartIdx + songsPerPage, updatedSongs.length);
                const updatedSongsToDisplay = updatedSongs.slice(updatedStartIdx, updatedEndIdx);
                
                // Create a new embed with the updated data
                const updatedEmbed = createQueueEmbed(updatedSongsToDisplay, updatedCurrent, updatedPage, updatedPageCount);
                
                // Update the buttons
                const updatedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('queue:first')
                            .setLabel('First')
                            .setEmoji('⏮️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(updatedPage === 1),
                            
                        new ButtonBuilder()
                            .setCustomId('queue:prev')
                            .setLabel('Previous')
                            .setEmoji('◀️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(updatedPage === 1),
                            
                        new ButtonBuilder()
                            .setCustomId('queue:refresh')
                            .setLabel(`${updatedPage}/${updatedPageCount}`)
                            .setEmoji('🔄')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('queue:next')
                            .setLabel('Next')
                            .setEmoji('▶️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(updatedPage === updatedPageCount || updatedPageCount === 0),
                            
                        new ButtonBuilder()
                            .setCustomId('queue:last')
                            .setLabel('Last')
                            .setEmoji('⏭️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(updatedPage === updatedPageCount || updatedPageCount === 0)
                    );
                    
                const updatedControlRow = new ActionRowBuilder()
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
                await buttonInteraction.update({ 
                    embeds: [updatedEmbed], 
                    components: [updatedRow, updatedControlRow] 
                });
            });
            
            collector.on('end', () => {
                // Remove the buttons when the collector expires
                interaction.editReply({ components: [] }).catch(console.error);
            });
        } else {
            // No pagination needed, just send the embed
            await interaction.reply({ embeds: [embed] });
        }
    }
};
