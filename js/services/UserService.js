// This file handle the user data and login/signup
// Each file do one thing (Cohesion)
// This file only use firebaseClient (Low Coupling)
// Controllers call these functions to get player data


class UserService {

    static async signUp(username, password) {
        const lowerUsername = username.toLowerCase();
        
        // 1. Check if username exists using a dedicated collection
        const usernameDoc = await db.collection('usernames').doc(lowerUsername).get();
        if (usernameDoc.exists) {
            throw new Error("Username is already taken. Please choose another one.");
        }

        const dummyEmail = `${lowerUsername}@tulipgardener.local`;

        // 2. Create the user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(dummyEmail, password);
        const user = userCredential.user;

        // 3. Get avatar
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

        // 4. Save profile in Firestore
        const batch = db.batch();
        
        // Save to users collection
        const userRef = db.collection('users').doc(user.uid);
        batch.set(userRef, {
            username: username,
            avatar_url: avatarUrl,
            score: 0,
            best_record: 0
        });

        // Save to usernames collection (to prevent duplicates)
        const usernameRef = db.collection('usernames').doc(lowerUsername);
        batch.set(usernameRef, { uid: user.uid });

        await batch.commit();

        return {
            user: user,
            username: username,
            avatarUrl: avatarUrl
        };
    }

    static async signIn(username, password) {
        const dummyEmail = `${username.toLowerCase()}@tulipgardener.local`;
        try {
            const userCredential = await auth.signInWithEmailAndPassword(dummyEmail, password);
            return userCredential.user;
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                throw new Error("Invalid username or password");
            }
            throw error;
        }
    }

    static async getProfile() {
        const user = auth.currentUser;
        if (!user) return null;

        const doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) throw new Error("Profile not found");
        
        // Return data + id
        return { id: doc.id, ...doc.data() };
    }

    static async incrementScore(timeTaken) {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const userRef = db.collection('users').doc(user.uid);
        
        // Use a transaction to safely update score and best record
        return await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(userRef);
            if (!doc.exists) throw "Document does not exist!";

            const currentScore = doc.data().score || 0;
            const currentBest = doc.data().best_record || 0;
            
            const newScore = currentScore + 1;
            let newBest = currentBest;
            
            if (timeTaken !== undefined && (newBest === 0 || timeTaken < newBest)) {
                newBest = timeTaken;
            }

            transaction.update(userRef, { 
                score: newScore, 
                best_record: newBest 
            });

            return { score: newScore, bestRecord: newBest };
        });
    }

    static async signOut() {
        await auth.signOut();
    }

    static async getCurrentUser() {
        return auth.currentUser; // Firebase keeps this cached
    }
}