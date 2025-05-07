const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Create an embed with common styling
 * 
 * @param {Object} options - Options for the embed
 * @param {string} options.title - The title of the embed
 * @param {string} options.description - The description for the embed
 * @param {string} options.color - The color for the embed (hex code)
 * @param {string} options.url - The URL for the embed title
 * @param {string} options.thumbnail - The thumbnail URL
 * @param {string} options.image - The image URL
 * @param {Array} options.fields - Array of field objects
 * @param {Object} options.footer - Footer object with text and icon_url
 * @param {Object} options.author - Author object with name, icon_url, and url
 * @param {number} options.timestamp - Timestamp (defaults to now)
 * @returns {EmbedBuilder} The created embed
 */
function createEmbed(options) {
    const embed = new EmbedBuilder();
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    
    // Set color with fallbacks
    if (options.color) {
        embed.setColor(options.color);
    } else {
        embed.setColor(config.style?.colors?.primary || '#FF0088');
    }
    
    if (options.url) embed.setURL(options.url);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.fields && options.fields.length > 0) embed.addFields(options.fields);
    if (options.footer) embed.setFooter(options.footer);
    if (options.author) embed.setAuthor(options.author);
    
    // Set timestamp (default to now)
    if (options.timestamp !== false) {
        embed.setTimestamp(options.timestamp || Date.now());
    }
    
    return embed;
}

/**
 * Create a success embed with style
 * 
 * @param {string} title - The title
 * @param {string} description - The description
 * @returns {EmbedBuilder} The created embed
 */
function createSuccessEmbed(title, description) {
    const emoji = config.style?.emojis?.success || '✅';
    
    return createEmbed({
        title: `${emoji} ${title}`,
        description: description,
        color: config.style?.colors?.success || '#2ECC71',
        footer: { text: 'Successfully completed' }
    });
}

/**
 * Create an error embed with style
 * 
 * @param {string} title - The title
 * @param {string} description - The description
 * @returns {EmbedBuilder} The created embed
 */
function createErrorEmbed(title, description) {
    const emoji = config.style?.emojis?.error || '❌';
    
    return createEmbed({
        title: `${emoji} ${title}`,
        description: description,
        color: config.style?.colors?.error || '#E74C3C',
        footer: { text: 'An error occurred' }
    });
}

/**
 * Create a warning embed with style
 * 
 * @param {string} title - The title
 * @param {string} description - The description
 * @returns {EmbedBuilder} The created embed
 */
function createWarningEmbed(title, description) {
    const emoji = config.style?.emojis?.warning || '⚠️';
    
    return createEmbed({
        title: `${emoji} ${title}`,
        description: description,
        color: config.style?.colors?.warning || '#F1C40F',
        footer: { text: 'Warning' }
    });
}

/**
 * Create an info embed with style
 * 
 * @param {string} title - The title
 * @param {string} description - The description
 * @returns {EmbedBuilder} The created embed
 */
function createInfoEmbed(title, description) {
    const emoji = config.style?.emojis?.info || 'ℹ️';
    
    return createEmbed({
        title: `${emoji} ${title}`,
        description: description,
        color: config.style?.colors?.info || '#3498DB',
        footer: { text: 'Information' }
    });
}

/**
 * Create a search result embed
 * 
 * @param {string} query - The search query
 * @param {Array} results - The search results
 * @returns {EmbedBuilder} The created embed
 */
function createSearchEmbed(query, results) {
    const emoji = config.style?.emojis?.search || '🔍';
    
    const embed = createEmbed({
        title: `${emoji} Search Results`,
        description: `Here are the results for: **${query}**`,
        color: config.style?.colors?.primary || '#FF0088',
        footer: { text: 'Select a song from the options below' }
    });
    
    results.forEach((result, index) => {
        embed.addFields({
            name: `${index + 1}. ${result.title.length > 60 ? result.title.substring(0, 57) + '...' : result.title}`,
            value: `Duration: **${result.durationRaw}** | Views: **${formatNumber(result.views)}** | Channel: **${result.channel.name}**`
        });
    });
    
    return embed;
}

/**
 * Create a now playing embed with visualization
 * 
 * @param {Object} song - The song information
 * @param {boolean} playing - Whether the song is playing
 * @param {number} volume - The current volume
 * @param {number} position - The current position in seconds
 * @returns {EmbedBuilder} The created embed
 */
function createNowPlayingEmbed(song, playing, volume, position) {
    // Get emoji based on state
    const stateEmoji = playing 
        ? config.style?.emojis?.play || '▶️' 
        : config.style?.emojis?.pause || '⏸️';
    
    // Calculate volume emoji based on volume level
    let volumeEmoji = config.style?.emojis?.mute || '🔇';
    if (volume > 70) {
        volumeEmoji = config.style?.emojis?.volume || '🔊';
    } else if (volume > 30) {
        volumeEmoji = '🔉';
    } else if (volume > 0) {
        volumeEmoji = '🔈';
    }
    
    // Create a visual progress bar if position is provided
    let progressBar = '';
    if (position && song.durationInSeconds) {
        const percentage = Math.min(position / song.durationInSeconds, 1);
        progressBar = createProgressBar(percentage);
    }
    
    return createEmbed({
        title: `${stateEmoji} Now Playing`,
        description: `### [${song.title}](${song.url})${progressBar ? `\n\n${progressBar}` : ''}`,
        color: config.style?.colors?.primary || '#FF0088',
        thumbnail: null, // No thumbnail when using full image
        image: song.thumbnail, // Use the thumbnail as full image
        fields: [
            { name: '⏱️ Duration', value: song.duration || 'Unknown', inline: true },
            { name: '👤 Requested by', value: song.requestedBy || 'Unknown', inline: true },
            { name: `${volumeEmoji} Volume`, value: `${volume}%`, inline: true },
            { 
                name: '📡 Source', 
                value: song.source === 'youtube' ? 'YouTube' : 'Unknown',
                inline: true 
            },
            { 
                name: '🎛️ Status', 
                value: playing ? 'Playing' : 'Paused', 
                inline: true 
            }
        ],
        footer: { text: 'Use the buttons below to control playback' }
    });
}

/**
 * Create a queue embed
 * 
 * @param {Array} songs - The songs in the queue
 * @param {Object} currentSong - The currently playing song
 * @param {number} page - The current page
 * @param {number} totalPages - The total number of pages
 * @returns {EmbedBuilder} The created embed
 */
function createQueueEmbed(songs, currentSong, page, totalPages) {
    const queueEmoji = config.style?.emojis?.queue || '📋';
    
    let description = '';
    
    // Add current song
    if (currentSong) {
        description += `**Now Playing:**\n`;
        description += `[${currentSong.title}](${currentSong.url}) | \`${currentSong.duration}\` | Requested by: ${currentSong.requestedBy}\n\n`;
    }
    
    // Add queue
    if (songs.length > 0) {
        description += `**Up Next:**\n`;
        
        songs.forEach((song, index) => {
            description += `**${index + 1 + (page - 1) * 10}.** [${song.title}](${song.url}) | \`${song.duration}\` | Requested by: ${song.requestedBy}\n`;
        });
    } else {
        description += `*The queue is empty. Add songs with the \`/play\` command!*`;
    }
    
    return createEmbed({
        title: `${queueEmoji} Queue - Page ${page}/${totalPages || 1}`,
        description: description,
        color: config.style?.colors?.primary || '#FF0088',
        footer: { 
            text: `${songs.length} songs in queue | Total duration: ${calculateTotalDuration(songs)}` 
        }
    });
}

/**
 * Helper function to create a progress bar
 * 
 * @param {number} percentage - Progress percentage (0-1)
 * @returns {string} The progress bar string
 */
function createProgressBar(percentage) {
    const progressBarLength = 15;
    const position = Math.floor(percentage * progressBarLength);
    
    let progressBar = '';
    
    for (let i = 0; i < progressBarLength; i++) {
        if (i === 0) {
            progressBar += '▁'; // Start
        } else if (i === progressBarLength - 1) {
            progressBar += '▄'; // End
        } else if (i === position) {
            progressBar += '█'; // Current position
        } else {
            progressBar += '▬'; // Empty
        }
    }
    
    return progressBar;
}

/**
 * Helper function to calculate total duration of songs
 * 
 * @param {Array} songs - List of songs
 * @returns {string} Formatted total duration
 */
function calculateTotalDuration(songs) {
    if (!songs || songs.length === 0) return '0:00';
    
    let totalSeconds = 0;
    
    songs.forEach(song => {
        if (song.durationInSeconds) {
            totalSeconds += song.durationInSeconds;
        } else if (song.duration) {
            // Try to parse from mm:ss format
            const parts = song.duration.split(':').map(part => parseInt(part, 10));
            
            if (parts.length === 2) {
                totalSeconds += parts[0] * 60 + parts[1];
            } else if (parts.length === 3) {
                totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
        }
    });
    
    // Format total seconds to hh:mm:ss
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Helper function to format large numbers
 * 
 * @param {number} num - The number to format
 * @returns {string} Formatted number (e.g. 1.5M, 500K)
 */
function formatNumber(num) {
    if (!num) return '0';
    
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else {
        return num.toString();
    }
}

module.exports = {
    createEmbed,
    createSuccessEmbed,
    createErrorEmbed,
    createWarningEmbed,
    createInfoEmbed,
    createSearchEmbed,
    createNowPlayingEmbed,
    createQueueEmbed,
    createProgressBar,
    formatNumber
};