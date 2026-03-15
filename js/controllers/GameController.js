// This controller manage the game, timer and score
// It use Heart API for puzzles and UserService for score
// It does not use Supabase directly
// Everything about game happen here (Cohesion)

class GameController {

    constructor(mode) {
        this.mode = mode || 'beginner';
        this.currentSolution = null;
        this.timerInterval = null;
        this.timeLeft = 0;
        this.overlayActive = false; 
    }

    // Start the game, get puzzle and start clock
    async init() {
        // Set seconds for different modes
        if (this.mode === 'intermediate') {
            this.timeLeft = 5;
        } else if (this.mode === 'pro') {
            this.timeLeft = 3;
        } else {
            this.timeLeft = 10;
        }

        // Fetch puzzle
        await this.loadPuzzle();

        // Track start time
        this.startTime = Date.now();

        // Update clock on screen
        this.updateTimerDisplay();

        // Start timer if not beginner
        if (this.mode !== 'beginner') {
            this.startTimer();
        }
    }

    // Get a puzzle from the service
    async loadPuzzle() {
        try {
            const puzzle = await HeartApiService.getPuzzle();
            this.currentSolution = puzzle.solution;

            // Show the puzzle image in UI
            const imgEl = document.getElementById('puzzle-image');
            imgEl.onload = () => {
                imgEl.classList.remove('puzzle-blur');
                const overlay = document.getElementById('loading-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.style.display = 'none', 500);
                }
            };
            imgEl.src = puzzle.imageUrl;
        } catch (error) {
            console.error('Failed to load puzzle:', error);
            alert('Failed to load puzzle. Please refresh.');
        }
    }

    // Start the game clock
    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showTimesUp();
            }
        }, 1000);
    }

    // Show the "Time's Up" blur screen
    showTimesUp() {
        // If incorrect screen is showing, just refresh the page
        if (this.overlayActive) {
            location.reload();
            return;
        }
        const overlay = document.getElementById('timesup-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            let count = 3;
            const counterEl = document.getElementById('timesup-counter');
            const countdown = setInterval(() => {
                count--;
                if (counterEl) counterEl.innerText = count;
                if (count <= 0) {
                    clearInterval(countdown);
                    location.reload();
                }
            }, 1000);
        } else {
            // Refresh if no screen found
            location.reload();
        }
    }

    // Update the clock text on the page
    updateTimerDisplay() {
        const timerEl = document.getElementById('timer-display');
        if (this.mode === 'beginner') {
            timerEl.innerText = '∞ Unlimited';
        } else {
            timerEl.innerText = `⏱ ${this.timeLeft}s`;
        }
    }

    // Check if the player's answer is correct
    async checkAnswer(userAnswer) {
        if (userAnswer === null || userAnswer === '') return;

        const answer = parseInt(userAnswer);
        if (isNaN(answer)) {
            alert('Please enter a valid number.');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) submitBtn.classList.add('btn-fade');

        if (answer === this.currentSolution) {
            // Stop timer
            if (this.timerInterval) clearInterval(this.timerInterval);

            // How long the player took to solve
            const timeTaken = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));

            // Save the score in database
            try {
                const result = await UserService.incrementScore(timeTaken);
                this.showCelebration(result.score);
            } catch (error) {
                console.error('Score update failed:', error);
                this.showCelebration(0); 
            }
        } else {
            this.showIncorrect();
            document.getElementById('answer-input').value = '';
            if (submitBtn) submitBtn.classList.remove('btn-fade');
        }
    }

    // Show "Incorrect" screen briefly
    showIncorrect() {
        const overlay = document.getElementById('incorrect-overlay');
        if (!overlay) return;
        this.overlayActive = true; 
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        // Hide after 1.8 seconds
        setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.transition = '';
                overlay.style.opacity = '1';
                this.overlayActive = false; 
            }, 500);
        }, 1800);
    }

    // Show the celebration screen and raining petals
    showCelebration(newScore) {
        const overlay = document.getElementById('celebration');
        const scoreEl = document.getElementById('celebration-score');
        if (scoreEl) scoreEl.innerText = newScore;
        overlay.classList.add('active');

        // Go to dashboard after 4 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 4000);
    }
}
