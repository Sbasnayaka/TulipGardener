// This file get the puzzles from the Heart API
// Each file do one thing (Cohesion)
// This file only know about the API (Low Coupling)
// Game Controller dont need to know the API URL


class HeartApiService {

    static API_URL = 'https://marcconrad.com/uob/heart/api.php?out=json';

    // This function fetch a puzzle from the API
    // It return the image and the answer
    static async getPuzzle() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) {
                throw new Error(`Heart API returned status ${response.status}`);
            }
            const data = await response.json();

            // API give us image url and answer
            return {
                imageUrl: data.question,
                solution: data.solution
            };
        } catch (error) {
            console.error('HeartApiService Error:', error);
            throw error;
        }
    }
}
