module.exports = {
    // Bot configuration
    token: process.env.DISCORD_TOKEN || 'YOUR_TOKEN_HERE',
    clientId: process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
    
    // Command configuration
    prefix: '!',  // For legacy text commands (if enabled)
    
    // Playback settings
    player: {
        defaultVolume: 50,           // Default volume on startup
        maxVolume: 100,              // Maximum volume level
        minVolume: 0,                // Minimum volume level
        leaveOnEmpty: true,          // Leave voice channel when empty
        leaveOnFinish: false,        // Leave voice channel when queue finishes
        leaveOnStop: false,          // Leave voice channel when stopped
        timeout: 60000,              // Timeout in ms before leaving (1 minute)
        quality: 'high',             // Audio quality
        bufferingTimeout: 3000,      // Buffering timeout in ms
        smoothTransition: true       // Enable smooth transitions between songs
    },
    
    // Queue settings
    queue: {
        maxSize: 500,                // Maximum queue size
        defaultLoopMode: 'none',     // Default loop mode: none, track, queue
        autoplay: false              // Autoplay similar songs when queue ends
    },
    
    // Search settings
    search: {
        maxResults: 5,               // Maximum search results
        searchTimeout: 60000         // Search timeout in ms
    },
    
    // DJ mode settings
    djMode: {
        enabled: false,              // Whether DJ mode is enabled
        djRoleName: 'DJ',            // Name of the DJ role
        commandsForDJsOnly: [        // Commands that only DJs can use
            'volume', 'stop', 'clearqueue', 'remove', 'skip', 'skipto'
        ]
    },
    
    // Message styling
    style: {
        // Modern color scheme like Lara Music
        colors: {
            primary: '#FF0088',      // Pink (primary color)
            secondary: '#9B59B6',    // Purple (secondary color)
            success: '#2ECC71',      // Green (success messages)
            warning: '#F1C40F',      // Yellow (warning messages)
            error: '#E74C3C',        // Red (error messages)
            info: '#3498DB'          // Blue (information messages)
        },
        emojis: {
            play: '▶️',
            pause: '⏸️',
            stop: '⏹️',
            skip: '⏭️',
            previous: '⏮️',
            repeat: '🔁',
            repeatOne: '🔂',
            volume: '🔊',
            mute: '🔇',
            queue: '📋',
            search: '🔍',
            error: '❌',
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        }
    },
    
    // Bot activity status
    activity: {
        name: '/help | Music Bot',
        type: 'LISTENING'  // LISTENING, PLAYING, WATCHING, STREAMING
    },
    
    // Owner information
    owner: {
        id: '',  // Owner's Discord ID
        notifications: true  // Whether to send notifications to the owner
    },
    
    // Bot information
    bot: {
        name: 'Discord Music Bot',
        version: '1.0.0',
        inviteUrl: '',
        supportServer: ''
    }
};
