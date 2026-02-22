/**
 * GameController.js
 * ------------------
 * SINGLE RESPONSIBILITY: Manage the game loop, timer, and scoring.
 * 
 * LOW COUPLING: Uses HeartApiService for puzzles, UserService for scores.
 *               Does NOT directly access Supabase or the Heart API URL.
 * HIGH COHESION: All game-related logic (timer, answer checking, celebration) is here.
 */

class GameController {

    constructor(mode) {
        this.mode = mode || 'beginner';
        this.currentSolution = null;
        this.timerInterval = null;
        this.timeLeft = 0;
    }

    /**
     * Initialize the game: fetch puzzle and start timer.
     */
    async init() {
        // Set timer based on mode
        if (this.mode === 'intermediate') {
            this.timeLeft = 30;
        } else if (this.mode === 'pro') {
            this.timeLeft = 10;
        }

        // Fetch puzzle
        await this.loadPuzzle();

        // Start timer if not beginner
        if (this.mode !== 'beginner') {
            this.startTimer();
        }
    }

    /**
     * Fetch a puzzle from the HeartApiService.
     */
    async loadPuzzle() {
        try {
            const puzzle = await HeartApiService.getPuzzle();
            this.currentSolution = puzzle.solution;

            // Update the UI
            document.getElementById('puzzle-image').src = puzzle.imageUrl;
        } catch (error) {
            console.error('Failed to load puzzle:', error);
            alert('Failed to load puzzle. Please refresh.');
        }
    }

    /**
     * Start the countdown timer.
     */
    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                alert("⏰ Time's up! Try again.");
                location.reload();
            }
        }, 1000);
    }

    /**
     * Update the timer text on screen.
     */
    updateTimerDisplay() {
        const timerEl = document.getElementById('timer-display');
        if (this.mode === 'beginner') {
            timerEl.innerText = '∞ Unlimited';
        } else {
            timerEl.innerText = `⏱ ${this.timeLeft}s`;
        }
    }

    /**
     * Check the user's answer against the solution.
     */
    async checkAnswer(userAnswer) {
        if (userAnswer === null || userAnswer === '') return;

        const answer = parseInt(userAnswer);
        if (isNaN(answer)) {
            alert('Please enter a valid number.');
            return;
        }

        if (answer === this.currentSolution) {
            // Stop timer
            if (this.timerInterval) clearInterval(this.timerInterval);

            // Update score in Supabase via UserService
            try {
                const result = await UserService.incrementScore();
                this.showCelebration(result.score);
            } catch (error) {
                console.error('Score update failed:', error);
                this.showCelebration(0); // Still celebrate even if save fails
            }
        } else {
            alert('❌ Incorrect! Try again.');
            document.getElementById('answer-input').value = '';
        }
    }

    /**
     * Show the celebration overlay animation.
     */
    showCelebration(newScore) {
        const overlay = document.getElementById('celebration');
        const scoreEl = document.getElementById('celebration-score');
        if (scoreEl) scoreEl.innerText = newScore;
        overlay.classList.add('active');

        // Auto redirect after 4 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 4000);
    }
}
