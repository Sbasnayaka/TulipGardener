// This controller handle the Login and Sign Up UI
// It talk to the UserService for the data
// It dont know about Supabase directly (Low Coupling)
// OnlyUserService talk to the database

class AuthController {

    // This function handle the Sign Up button
    // It is called from the auth form
    static async handleSignUp(username, password) {
        try {
            const result = await UserService.signUp(username, password);

            // Go to welcome page if signup is good
            window.location.href = `welcome.html?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(result.avatarUrl)}`;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // This handle the Login button
    // It is called from the login form
    static async handleLogin(username, password) {
        try {
            await UserService.signIn(username, password);

            // Get player profile to show his name
            const profile = await UserService.getProfile();

            window.location.href = `welcome.html?username=${encodeURIComponent(profile.username)}&avatar=${encodeURIComponent(profile.avatar_url)}`;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // This function handle logout
    static async handleLogout() {
        try {
            await UserService.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    // Check if player is logged in, if not go to index page
    static async requireAuth() {
        const user = await UserService.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // This listener check if user log out in another tab
    // Or if the session end
    static initAuthListener() {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            // If user sign out, go back to home page
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                const protectedPages = ['welcome.html', 'dashboard.html', 'profile.html', 'game.html'];
                const currentPage = window.location.pathname.split('/').pop() || '';

                if (protectedPages.includes(currentPage)) {
                    window.location.href = 'index.html';
                }
            }
            //  ignore INITIAL_SESSION or TOKEN_REFRESHED to avoid unnecessary redirects
        });
    }
}

// Start the listener when the page load
AuthController.initAuthListener();
