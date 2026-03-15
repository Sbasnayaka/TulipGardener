//SINGLE RESPONSIBILITY: Handle authentication UI interactions.
//LOW COUPLING: This controller talks to UserService methods.
//Does NOT know about Supabase directly.
//Does NOT contain any database logic.

class AuthController {

    //Handle the Sign Up form submission.
    //Called from auth.html's form onsubmit.
    static async handleSignUp(username, password) {
        try {
            const result = await UserService.signUp(username, password);

            // Redirect to welcome page with user info
            window.location.href = `welcome.html?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(result.avatarUrl)}`;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    //Handle the Login form submission.
    //Called from auth.html's form onsubmit.
    static async handleLogin(username, password) {
        try {
            await UserService.signIn(username, password);

            // Get profile to redirect with username
            const profile = await UserService.getProfile();

            window.location.href = `welcome.html?username=${encodeURIComponent(profile.username)}&avatar=${encodeURIComponent(profile.avatar_url)}`;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    //Handle logout.
    static async handleLogout() {
        try {
            await UserService.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    //Check if user is logged in, redirect to index if not.
    static async requireAuth() {
        const user = await UserService.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    //Listen for auth changes (like token refreshes or actual sign outs) 
    //to manage session state globally without disruptive redirects on network blips.
    static initAuthListener() {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            // Only redirect if explicitly signed out or user deleted
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

// Auto-initialize the listener when the controller loads
AuthController.initAuthListener();
