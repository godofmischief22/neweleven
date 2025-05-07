class Queue {
    constructor(guildId, options = {}) {
        this.guildId = guildId;
        this.songs = [];
        this.playing = false;
        this.volume = options.volume || 50;
        this.loop = false;
        this.connection = null;
        this.audioPlayer = null;
        this.resource = null;
        this.currentSong = null;
        this.textChannel = null;
        this.trackingInterval = null; // For tracking song progress
    }

    // Add a song to the queue
    addSong(song) {
        this.songs.push(song);
        return this.songs.length - 1; // Return the position in queue
    }

    // Add multiple songs to the queue
    addSongs(songs) {
        this.songs = this.songs.concat(songs);
        return this.songs.length - songs.length; // Return the position in queue for the first song
    }

    // Get the next song in the queue
    getNextSong() {
        if (this.loop && this.currentSong) {
            return this.currentSong;
        }
        
        const nextSong = this.songs.shift();
        this.currentSong = nextSong;
        return nextSong;
    }

    // Clear the queue
    clear() {
        this.songs = [];
        this.currentSong = null;
    }

    // Get the current queue
    getSongs() {
        return this.songs;
    }

    // Get the current song
    getCurrentSong() {
        return this.currentSong;
    }

    // Set playing state
    setPlaying(state) {
        this.playing = state;
    }

    // Check if queue is empty
    isEmpty() {
        return this.songs.length === 0 && !this.currentSong;
    }

    // Get queue length
    get length() {
        return this.songs.length;
    }

    // Toggle loop mode
    toggleLoop() {
        this.loop = !this.loop;
        return this.loop;
    }

    // Set loop mode
    setLoop(state) {
        this.loop = state;
        return this.loop;
    }

    // Set volume
    setVolume(volume) {
        this.volume = volume;
        if (this.resource) {
            this.resource.volume.setVolume(volume / 100);
        }
        return volume;
    }

    // Destroy queue resources
    destroy() {
        this.clear();
        this.playing = false;
        
        // Clean up tracking interval
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        
        if (this.connection) {
            this.connection.destroy();
        }
        
        this.connection = null;
        this.audioPlayer = null;
        this.resource = null;
        this.currentSong = null;
        this.textChannel = null;
    }
}

module.exports = Queue;
