// Import the functions needed from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqHEFIQyQhuKmEJArNbpQPgPSlfKQGC6I",
    authDomain: "universum-20736.firebaseapp.com",
    projectId: "universum-20736",
    storageBucket: "universum-20736.appspot.com",
    messagingSenderId: "821262165744",
    appId: "1:821262165744:web:03e7461139608b5a5c0435"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to fetch user settings from Firestore
async function fetchUserSettings(userId) {
    try {
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userProfileSnapshot = await getDoc(userProfileRef);

        if (userProfileSnapshot.exists()) {
            const userProfile = userProfileSnapshot.data();
            return userProfile.settings || null;
        } else {
            console.log('User profile document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
    }
}

export {
    db,
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    fetchUserSettings,
    collection,
    addDoc,
    updateDoc,
    doc
  };