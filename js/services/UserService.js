/**
 * UserService.js
 * ---------------
 * SINGLE RESPONSIBILITY: All user-related operations (Auth + Profile Data).
 * 
 * HIGH COHESION: Everything about the "User" concept lives here.
 * LOW COUPLING: This service only depends on `supabaseClient`. 
 *               Controllers call these methods without knowing Supabase internals.
 */

class UserService {

    /**
     * Sign up a new user with email and password.
     * Also creates a profile row in the `profiles` table.
     */
    static async signUp(username, password) {
        // 0. Check for duplicate username first to prevent dangling auth users
        const { data: existingUser, error: checkError } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 means 0 rows returned, which is fine here. 
            // If it's another error, throw it.
            throw checkError;
        }

        if (existingUser) {
            throw new Error("Username is already taken. Please choose another one.");
        }

        const dummyEmail = `${username}@tulipgardener.local`;

        // 1. Create auth user
        const { data, error } = await supabaseClient.auth.signUp({
            email: dummyEmail,
            password: password,
        });

        if (error) throw error;

        // 2. Generate DiceBear avatar
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

        // 3. Create profile in `profiles` table
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
                id: data.user.id,
                username: username,
                avatar_url: avatarUrl,
                score: 0,
                best_record: 0
            });

        if (profileError) throw profileError;

        return {
            user: data.user,
            username: username,
            avatarUrl: avatarUrl
        };
    }

    /**
     * Sign in an existing user.
     */
    static async signIn(username, password) {
        const dummyEmail = `${username}@tulipgardener.local`;
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: dummyEmail,
            password: password,
        });

        if (error) {
            if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid Date")) {
                throw new Error("Invalid username or password");
            }
            throw error;
        }
        return data;
    }

    /**
     * Get the currently logged-in user's profile data.
     */
    static async getProfile() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update the user's score. Increments by 1 and updates best_record if needed.
     */
    static async incrementScore() {
        const profile = await this.getProfile();
        if (!profile) throw new Error('No profile found');

        const newScore = profile.score + 1;
        const newBest = Math.max(profile.best_record, newScore);

        const { error } = await supabaseClient
            .from('profiles')
            .update({ score: newScore, best_record: newBest })
            .eq('id', profile.id);

        if (error) throw error;
        return { score: newScore, bestRecord: newBest };
    }

    /**
     * Sign out the current user.
     */
    static async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    }

    /**
     * Check if a user is currently logged in.
     */
    static async getCurrentUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    }
}
