// This controller manage the music for the whole app
// It remember the music time when you change the page
// So the music keep playing from same place

class AudioController {
    constructor() {
        this.audio = new Audio('assets/background song.mp3');
        this.audio.loop = true;
        // Load the volume from settings
        const savedVolume = localStorage.getItem('bgVolume');
        this.audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3; // Default is 30%

        
        // Try to go back to the same music time
        const savedTime = sessionStorage.getItem('bgMusicTime');
        if (savedTime) {
            this.audio.currentTime = parseFloat(savedTime);
        }

        // Try to play music now
        // Browser need a user click first sometimes
        // If it fail, we wait for a click
        this.playAudio();

        // Save the music time before page close
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('bgMusicTime', this.audio.currentTime);
        });
        
        // If music not start, try play when user click anywhere
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
