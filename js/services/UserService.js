// This file handle the user data and login/signup
// Each file do one thing (Cohesion)
// This file only use supabaseClient (Low Coupling)
// Controllers call these functions to get player data


class UserService {

    // Create a new user account
    // It also save a profile in the table
    static async signUp(username, password) {
        // We check if username already exist
        const { data: existingUser, error: checkError } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 means user not found, that is ok
            // If it's another error, throw it.
            throw checkError;
        }

        if (existingUser) {
            throw new Error("Username is already taken. Please choose another one.");
        }

        const dummyEmail = `${username}@tulipgardener.local`;

        // Create the user in Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email: dummyEmail,
            password: password,
        });

        if (error) throw error;

        // Get a nice avatar for the player
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

        // Save the player profile in database
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

    // Login an existing user
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

    // Get the profile of the current player
    static async getProfile() {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !session) return null;

        const user = session.user;

        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    }

    // Update the player score and record
    static async incrementScore(timeTaken) {
        const profile = await this.getProfile();
        if (!profile) throw new Error('No profile found');

        const newScore = profile.score + 1;

        // Save the best time for solving puzzle
        let newBest = profile.best_record;
        if (timeTaken !== undefined) {
            // Uninitialized or strict improvement
            if (newBest === 0 || timeTaken < newBest) {
                newBest = timeTaken;
            }
        }

        const { error } = await supabaseClient
            .from('profiles')
            .update({ score: newScore, best_record: newBest })
            .eq('id', profile.id);

        if (error) throw error;
        return { score: newScore, bestRecord: newBest };
    }

    // Logout the player
    static async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    }

    // Check if player is logged in now
    static async getCurrentUser() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) return null;
        return session.user;
    }
}
