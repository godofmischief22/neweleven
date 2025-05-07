const { 
    createAudioPlayer, 
    createAudioResource, 
    joinVoiceChannel, 
    AudioPlayerStatus, 
    VoiceConnectionStatus, 
    entersState
} = require('@discordjs/voice');
const play = require('play-dl');
const Queue = require('./queue');
const { createEmbed } = require('./embed');

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the player
function createPlayer(client) {
    if (!client.queues) {
        client.queues = new Map();
    }
    
    return {
        // Get or create a queue for a guild
        getQueue(guildId) {
            if (!client.queues.has(guildId)) {
                client.queues.set(guildId, new Queue(guildId));
            }
            return client.queues.get(guildId);
        },
        
        // Play a song in a voice channel
        async play(interaction, song) {
            const guildId = interaction.guildId;
            const queue = this.getQueue(guildId);
            
            try {
                // If there's no connection, create one
                if (!queue.connection) {
                    const member = interaction.member;
                    if (!member.voice.channel) {
                        return { success: false, message: "You need to join a voice channel first!" };
                    }
                    
                    // Set text channel for sending messages
                    queue.textChannel = interaction.channel;
                    
                    // Create a voice connection
                    queue.connection = joinVoiceChannel({
                        channelId: member.voice.channel.id,
                        guildId: guildId,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    
                    // Handle disconnections
                    queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
                        try {
                            // Try to reconnect
                            await Promise.race([
                                entersState(queue.connection, VoiceConnectionStatus.Signalling, 5_000),
                                entersState(queue.connection, VoiceConnectionStatus.Connecting, 5_000),
                            ]);
                            // Seems to be reconnecting to a new channel
                        } catch (error) {
                            // Seems to be a disconnect, destroy and clear queue
                            if (queue.connection) {
                                queue.connection.destroy();
                                client.queues.delete(guildId);
                            }
                        }
                    });
                    
                    // Create an audio player if one doesn't exist
                    if (!queue.audioPlayer) {
                        queue.audioPlayer = createAudioPlayer();
                        queue.connection.subscribe(queue.audioPlayer);
                        
                        // Handle player state changes
                        queue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                            if (queue.loop && queue.currentSong) {
                                this.playSong(queue, queue.currentSong);
                            } else {
                                const nextSong = queue.getNextSong();
                                if (nextSong) {
                                    this.playSong(queue, nextSong);
                                } else {
                                    // If no more songs, clear current song and set playing to false
                                    queue.currentSong = null;
                                    queue.setPlaying(false);
                                    
                                    // Optional: Leave if there are no more songs
                                    // if (queue.connection) {
                                    //     queue.connection.destroy();
                                    //     client.queues.delete(guildId);
                                    // }
                                }
                            }
                        });
                        
                        // Handle errors
                        queue.audioPlayer.on('error', error => {
                            console.error(`Error: ${error.message} with resource ${error.resource.metadata}`);
                            queue.audioPlayer.stop();
                        });
                    }
                }
                
                // Add song to queue
                if (song) {
                    const position = queue.addSong(song);
                    
                    // If not playing, start playing
                    if (!queue.playing) {
                        const songToPlay = queue.getNextSong();
                        await this.playSong(queue, songToPlay);
                        return { success: true, message: `Playing **${song.title}**`, position: 0 };
                    }
                    
                    return { success: true, message: `Added **${song.title}** to the queue at position ${position + 1}`, position };
                } else {
                    // Resume playback if there's a current song but not playing
                    if (queue.currentSong && !queue.playing) {
                        queue.audioPlayer.unpause();
                        queue.setPlaying(true);
                        return { success: true, message: `Resumed playing **${queue.currentSong.title}**` };
                    }
                    return { success: false, message: "No song to play!" };
                }
            } catch (error) {
                console.error("Error in play function:", error);
                return { success: false, message: `Error: ${error.message}` };
            }
        },

        // Play a specific song in the queue
        async playSong(queue, song) {
            try {
                // Make sure the song info has everything we need
                if (!song || !song.url) {
                    throw new Error("Invalid song data");
                }
                
                // Check if the URL is a YouTube URL
                if (song.source === 'youtube' || song.url.includes('youtube.com') || song.url.includes('youtu.be')) {
                    const stream = await play.stream(song.url);
                    
                    // Get song info (including duration) if not already present
                    if (!song.durationInSeconds) {
                        try {
                            const songInfo = await play.video_info(song.url);
                            const videoDetails = songInfo.video_details;
                            
                            // Update song with more details
                            song.durationInSeconds = videoDetails.durationInSec;
                            song.duration = videoDetails.durationRaw;
                            song.thumbnail = videoDetails.thumbnails[0].url;
                            song.channelName = videoDetails.channel.name;
                            song.views = videoDetails.views;
                        } catch (infoError) {
                            console.error("Could not fetch video details:", infoError);
                        }
                    }
                    
                    // Create an audio resource from the stream
                    const resource = createAudioResource(stream.stream, {
                        inputType: stream.type,
                        metadata: {
                            title: song.title,
                            url: song.url
                        },
                        inlineVolume: true
                    });
                    
                    // Set the volume
                    resource.volume.setVolume(queue.volume / 100);
                    queue.resource = resource;
                    
                    // Reset song playback tracking
                    song.startTime = Date.now();
                    song.playbackPosition = 0;
                    queue.currentSong = song;
                    
                    // Set up a playback tracking interval
                    if (queue.trackingInterval) {
                        clearInterval(queue.trackingInterval);
                    }
                    
                    queue.trackingInterval = setInterval(() => {
                        if (queue.playing && queue.currentSong) {
                            // Calculate current position
                            const elapsed = Math.floor((Date.now() - queue.currentSong.startTime) / 1000);
                            queue.currentSong.playbackPosition = elapsed;
                            queue.currentSong.currentTime = formatTime(elapsed);
                        }
                    }, 1000);
                    
                    // Play the song
                    queue.audioPlayer.play(resource);
                    queue.setPlaying(true);
                    
                    // Send a now playing message with enhanced visuals
                    if (queue.textChannel) {
                        const embed = createEmbed({
                            title: '🎸 Now Playing',
                            description: `[${song.title}](${song.url})`,
                            color: '#FF0088', // Pink color like "Lara Music"
                            image: song.thumbnail, // Full-size image
                            fields: [
                                { name: '⏱️ Duration', value: song.duration || 'Unknown', inline: true },
                                { name: '👤 Requested by', value: song.requestedBy || 'Unknown', inline: true },
                                { name: '📻 Channel', value: song.channelName || 'Unknown', inline: true },
                                { name: '🎧 Quality', value: 'High Quality', inline: true }
                            ],
                            footer: {
                                text: `🎵 Use /nowplaying for playback controls`
                            }
                        });
                        
                        queue.textChannel.send({ embeds: [embed] }).catch(console.error);
                    }
                    
                    return { success: true, message: `Now playing: ${song.title}` };
                } else {
                    throw new Error("Only YouTube links are supported at the moment");
                }
            } catch (error) {
                console.error("Error playing song:", error);
                
                // Skip to the next song if there's an error
                if (queue.audioPlayer) {
                    queue.audioPlayer.stop();
                }
                
                if (queue.textChannel) {
                    queue.textChannel.send(`Error playing song: ${error.message}`).catch(console.error);
                }
                
                return { success: false, message: `Error: ${error.message}` };
            }
        },
        
        // Pause the current song
        pause(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue || !queue.audioPlayer || !queue.playing) {
                return { success: false, message: "No song is currently playing!" };
            }
            
            queue.audioPlayer.pause();
            queue.setPlaying(false);
            
            return { success: true, message: "Paused the current song" };
        },
        
        // Resume the current song
        resume(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue || !queue.audioPlayer) {
                return { success: false, message: "No audio player found!" };
            }
            
            if (queue.playing) {
                return { success: false, message: "The song is already playing!" };
            }
            
            queue.audioPlayer.unpause();
            queue.setPlaying(true);
            
            return { success: true, message: "Resumed the current song" };
        },
        
        // Skip the current song
        skip(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue || !queue.audioPlayer) {
                return { success: false, message: "No audio player found!" };
            }
            
            const currentSong = queue.getCurrentSong();
            queue.audioPlayer.stop();
            
            return { 
                success: true, 
                message: currentSong ? `Skipped **${currentSong.title}**` : "Skipped the current song" 
            };
        },
        
        // Stop playing and clear the queue
        stop(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue || !queue.audioPlayer) {
                return { success: false, message: "No audio player found!" };
            }
            
            queue.clear();
            queue.audioPlayer.stop();
            queue.setPlaying(false);
            
            if (queue.connection) {
                queue.connection.destroy();
            }
            
            client.queues.delete(guildId);
            
            return { success: true, message: "Stopped the music and cleared the queue" };
        },
        
        // Set the volume
        setVolume(guildId, volume) {
            const queue = this.getQueue(guildId);
            
            if (!queue) {
                return { success: false, message: "No queue found!" };
            }
            
            // Validate volume
            if (isNaN(volume) || volume < 0 || volume > 100) {
                return { success: false, message: "Volume must be a number between 0 and 100!" };
            }
            
            const newVolume = queue.setVolume(volume);
            
            return { success: true, message: `Volume set to ${newVolume}%` };
        },
        
        // Get the current queue
        getQueueList(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue) {
                return { success: false, message: "No queue found!" };
            }
            
            const currentSong = queue.getCurrentSong();
            const songs = queue.getSongs();
            
            return { 
                success: true, 
                current: currentSong, 
                songs: songs, 
                playing: queue.playing 
            };
        },
        
        // Get the currently playing song with playback information
        getNowPlaying(guildId) {
            const queue = this.getQueue(guildId);
            
            if (!queue) {
                return { success: false, message: "No queue found!" };
            }
            
            const currentSong = queue.getCurrentSong();
            
            if (!currentSong) {
                return { success: false, message: "No song is currently playing!" };
            }
            
            // If no current time is set, calculate it now
            if (!currentSong.currentTime && queue.playing) {
                const elapsed = Math.floor((Date.now() - (currentSong.startTime || Date.now())) / 1000);
                currentSong.playbackPosition = elapsed;
                currentSong.currentTime = formatTime(elapsed);
            }
            
            return { 
                success: true, 
                song: currentSong, 
                playing: queue.playing,
                volume: queue.volume,
                loop: queue.loop || false
            };
        }
    };
}

module.exports = { createPlayer };
