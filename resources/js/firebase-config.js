// Import the functions needed from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, addDoc, updateDoc, collection, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

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
        const userSettingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
        const lastCachedTimestamp = localStorage.getItem('userSettingsLastCachedTimestamp');
        const userSettingsSnapshotMetadata = await getDoc(userSettingsRef, { source: 'cache' });

        if (userSettingsSnapshotMetadata.exists()) {
            const lastUpdatedTimestamp = userSettingsSnapshotMetadata.get('lastUpdated').toMillis();

            if (!lastCachedTimestamp || lastUpdatedTimestamp > parseInt(lastCachedTimestamp)) {
                const userSettingsSnapshot = await getDoc(userSettingsRef);
                const userSettings = userSettingsSnapshot.data();
                localStorage.setItem('userSettings', JSON.stringify(userSettings));
                localStorage.setItem('userSettingsLastCachedTimestamp', lastUpdatedTimestamp.toString());
                return userSettings;
            } else {
                const cachedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
                return cachedUserSettings;
            }
        } else {
            console.log('User settings document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
    }
}

// Function to fetch user progress from Firestore
async function fetchUserProgress(userId) {
    try {
        const userProgressRef = collection(db, 'users', userId, 'progress');
        const lastCachedTimestamp = localStorage.getItem('userProgressLastCachedTimestamp');
        const userProgressQuery = lastCachedTimestamp
            ? query(userProgressRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)))
            : userProgressRef;
        const userProgressSnapshot = await getDocs(userProgressQuery);

        if (!userProgressSnapshot.empty) {
            const progressData = {};
            userProgressSnapshot.forEach(doc => {
                progressData[doc.id] = doc.data();
            });
            localStorage.setItem('userProgress', JSON.stringify(progressData));
            localStorage.setItem('userProgressLastCachedTimestamp', new Date().toISOString());
            return progressData;
        } else {
            const cachedUserProgress = JSON.parse(localStorage.getItem('userProgress'));
            return cachedUserProgress || null;
        }
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return null;
    }
}

// Function to fetch user achievements from Firestore
async function fetchUserAchievements(userId) {
    try {
        const userAchievementsRef = collection(db, 'users', userId, 'achievements');
        const lastCachedTimestamp = localStorage.getItem('userAchievementsLastCachedTimestamp');
        const userAchievementsQuery = lastCachedTimestamp
            ? query(userAchievementsRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)))
            : userAchievementsRef;
        const userAchievementsSnapshot = await getDocs(userAchievementsQuery);

        if (!userAchievementsSnapshot.empty) {
            const achievementsData = {};
            userAchievementsSnapshot.forEach(doc => {
                achievementsData[doc.id] = doc.data();
            });
            localStorage.setItem('userAchievements', JSON.stringify(achievementsData));
            localStorage.setItem('userAchievementsLastCachedTimestamp', new Date().toISOString());
            return achievementsData;
        } else {
            const cachedUserAchievements = JSON.parse(localStorage.getItem('userAchievements'));
            return cachedUserAchievements || null;
        }
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        return null;
    }
}

// Function to fetch user goals from Firestore
async function fetchUserGoals(userId) {
    try {
        const userGoalsRef = collection(db, 'users', userId, 'goals');
        const lastCachedTimestamp = localStorage.getItem('userGoalsLastCachedTimestamp');
        const userGoalsQuery = lastCachedTimestamp
            ? query(userGoalsRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)))
            : userGoalsRef;
        const userGoalsSnapshot = await getDocs(userGoalsQuery);

        if (!userGoalsSnapshot.empty) {
            const goalsData = {};
            userGoalsSnapshot.forEach(doc => {
                goalsData[doc.id] = doc.data();
            });
            localStorage.setItem('userGoals', JSON.stringify(goalsData));
            localStorage.setItem('userGoalsLastCachedTimestamp', new Date().toISOString());
            return goalsData;
        } else {
            const cachedUserGoals = JSON.parse(localStorage.getItem('userGoals'));
            return cachedUserGoals || null;
        }
    } catch (error) {
        console.error('Error fetching user goals:', error);
        return null;
    }
}

// Function to fetch user recommendations from Firestore
async function fetchUserRecommendations(userId) {
    try {
        const userRecommendationsRef = collection(db, 'users', userId, 'recommendations');
        const lastCachedTimestamp = localStorage.getItem('userRecommendationsLastCachedTimestamp');
        const userRecommendationsQuery = lastCachedTimestamp
            ? query(userRecommendationsRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)))
            : userRecommendationsRef;
        const userRecommendationsSnapshot = await getDocs(userRecommendationsQuery);

        if (!userRecommendationsSnapshot.empty) {
            const recommendationsData = {};
            userRecommendationsSnapshot.forEach(doc => {
                recommendationsData[doc.id] = doc.data();
            });
            localStorage.setItem('userRecommendations', JSON.stringify(recommendationsData));
            localStorage.setItem('userRecommendationsLastCachedTimestamp', new Date().toISOString());
            return recommendationsData;
        } else {
            const cachedUserRecommendations = JSON.parse(localStorage.getItem('userRecommendations'));
            return cachedUserRecommendations || null;
        }
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
        return null;
    }
}

// Function to fetch user statistics from Firestore
async function fetchUserStatistics(userId) {
    try {
        const userStatisticsRef = collection(db, 'users', userId, 'statistics');
        const lastCachedTimestamp = localStorage.getItem('userStatisticsLastCachedTimestamp');
        const userStatisticsQuery = lastCachedTimestamp
            ? query(userStatisticsRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)))
            : userStatisticsRef;
        const userStatisticsSnapshot = await getDocs(userStatisticsQuery);

        if (!userStatisticsSnapshot.empty) {
            const statisticsData = {};
            userStatisticsSnapshot.forEach(doc => {
                statisticsData[doc.id] = doc.data();
            });
            localStorage.setItem('userStatistics', JSON.stringify(statisticsData));
            localStorage.setItem('userStatisticsLastCachedTimestamp', new Date().toISOString());
            return statisticsData;
        } else {
            const cachedUserStatistics = JSON.parse(localStorage.getItem('userStatistics'));
            return cachedUserStatistics || null;
        }
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        return null;
    }
}

// Function to fetch user goals from Firestore
async function fetchUserProfile(userId) {
    try {
        const userProfileRef = doc(db, 'users', userId, 'profile', 'profileData');
        const lastCachedTimestamp = localStorage.getItem('userProfileLastCachedTimestamp');
        const userProfileSnapshotMetadata = await getDoc(userProfileRef, { source: 'cache' });

        if (userProfileSnapshotMetadata.exists()) {
            const lastUpdatedTimestamp = userProfileSnapshotMetadata.get('lastUpdated').toMillis();

            if (!lastCachedTimestamp || lastUpdatedTimestamp > parseInt(lastCachedTimestamp)) {
                const userProfileSnapshot = await getDoc(userProfileRef);
                const userProfile = userProfileSnapshot.data();
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                localStorage.setItem('userProfileLastCachedTimestamp', lastUpdatedTimestamp.toString());
                return userProfile;
            } else {
                const cachedUserProfile = JSON.parse(localStorage.getItem('userProfile'));
                return cachedUserProfile;
            }
        } else {
            console.log('User profileData document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

export {
    db,
    auth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    fetchUserSettings,
    fetchUserProgress,
    fetchUserAchievements,
    fetchUserGoals,
    fetchUserRecommendations,
    fetchUserStatistics,
    fetchUserProfile,
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp
  };