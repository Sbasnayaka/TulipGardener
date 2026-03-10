/**
 * AudioController.js
 * Handles global background music across the MPA (Multi-Page Application).
 * Uses sessionStorage to persist the playback time between page loads,
 * creating the illusion of a single continuous track.
 */
class AudioController {
    constructor() {
        this.audio = new Audio('assets/background song.mp3');
        this.audio.loop = true;
        // Load background volume from settings if available
        const savedVolume = localStorage.getItem('bgVolume');
        this.audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3; // Default 30% volume

        
        // Attempt to load previous playback time
        const savedTime = sessionStorage.getItem('bgMusicTime');
        if (savedTime) {
            this.audio.currentTime = parseFloat(savedTime);
        }

        // Try playing immediately
        // Note: Modern browsers require a user interaction first.
        // If it fails, we fall back to waiting for a click.
        this.playAudio();

        // Save time right before the user navigates away
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('bgMusicTime', this.audio.currentTime);
        });
        
        // If playback was blocked initially, try to play on the first interaction
        document.body.addEventListener('click', () => {
            if (this.audio.paused) {
                this.playAudio();
            }
        }, { once: true });
    }

    playAudio() {
        this.audio.play().catch(e => {
            console.log("Autoplay prevented by browser. Waiting for interaction.", e);
        });
    }
}

// Initialize globally as soon as script runs
window.globalAudio = new AudioController();
