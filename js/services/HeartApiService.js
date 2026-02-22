/**
 * HeartApiService.js
 * -------------------
 * SINGLE RESPONSIBILITY: Fetch puzzles from the Heart API.
 * 
 * HIGH COHESION: This module ONLY knows about the Heart API.
 * LOW COUPLING: If the API changes, we ONLY change this file.
 *               The GameController doesn't know the API URL or response format.
 */

class HeartApiService {

    static API_URL = 'http://marcconrad.com/uob/heart/api.php?out=json';

    /**
     * Fetches a puzzle from the Heart API.
     * Returns { question: 'image_url', solution: number }
     */
    static async getPuzzle() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) {
                throw new Error(`Heart API returned status ${response.status}`);
            }
            const data = await response.json();

            // The API returns { question: "url_to_image", solution: number }
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
