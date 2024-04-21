// Import the functions needed from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, addDoc, updateDoc, collection, deleteDoc, serverTimestamp, query, where } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

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
        const cachedUserSettings = JSON.parse(localStorage.getItem('userSettings'));

        const userSettingsSnapshot = await getDoc(userSettingsRef);

        if (userSettingsSnapshot.exists()) {
            const serverUserSettings = userSettingsSnapshot.data();
            const serverLastUpdated = serverUserSettings.lastUpdated.toMillis();

            if (!cachedUserSettings || serverLastUpdated > cachedUserSettings.lastUpdated) {
                serverUserSettings.lastUpdated = serverLastUpdated;
                localStorage.setItem('userSettings', JSON.stringify(serverUserSettings));
                return serverUserSettings;
            } else {
                return cachedUserSettings;
            }
        } else {
            console.log('User settings document does not exist');
            localStorage.removeItem('userSettings');
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
        const cachedUserProgress = JSON.parse(localStorage.getItem('userProgress'));

        if (cachedUserProgress && cachedUserProgress.lastUpdated) {
            const lastCachedTimestamp = cachedUserProgress.lastUpdated;
            const userProgressQuery = query(userProgressRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)));
            const userProgressSnapshot = await getDocs(userProgressQuery);

            if (!userProgressSnapshot.empty) {
                const progressData = {};
                userProgressSnapshot.forEach(doc => {
                    progressData[doc.id] = doc.data();
                    progressData[doc.id].lastUpdated = progressData[doc.id].lastUpdated.toMillis();
                });
                const updatedUserProgress = { ...cachedUserProgress, ...progressData };
                updatedUserProgress.lastUpdated = new Date().getTime();
                localStorage.setItem('userProgress', JSON.stringify(updatedUserProgress));
                return updatedUserProgress;
            } else {
                return cachedUserProgress;
            }
        } else {
            const userProgressSnapshot = await getDocs(userProgressRef);

            if (!userProgressSnapshot.empty) {
                const progressData = {};
                userProgressSnapshot.forEach(doc => {
                    progressData[doc.id] = doc.data();
                    progressData[doc.id].lastUpdated = progressData[doc.id].lastUpdated.toMillis();
                });
                progressData.lastUpdated = new Date().getTime();
                localStorage.setItem('userProgress', JSON.stringify(progressData));
                return progressData;
            } else {
                return null;
            }
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
        const cachedUserAchievements = JSON.parse(localStorage.getItem('userAchievements'));

        if (cachedUserAchievements && cachedUserAchievements.lastUpdated) {
            const lastCachedTimestamp = cachedUserAchievements.lastUpdated;
            const userAchievementsQuery = query(userAchievementsRef, where('lastUpdated', '>', new Date(lastCachedTimestamp)));
            const userAchievementsSnapshot = await getDocs(userAchievementsQuery);

            if (!userAchievementsSnapshot.empty) {
                const achievementsData = {};
                userAchievementsSnapshot.forEach(doc => {
                    achievementsData[doc.id] = doc.data();
                });
                const updatedUserAchievements = { ...cachedUserAchievements, ...achievementsData };
                updatedUserAchievements.lastUpdated = new Date().getTime();
                localStorage.setItem('userAchievements', JSON.stringify(updatedUserAchievements));
                return updatedUserAchievements;
            } else {
                return cachedUserAchievements;
            }
        } else {
            const userAchievementsSnapshot = await getDocs(userAchievementsRef);

            if (!userAchievementsSnapshot.empty) {
                const achievementsData = {};
                userAchievementsSnapshot.forEach(doc => {
                    achievementsData[doc.id] = doc.data();
                });
                achievementsData.lastUpdated = new Date().getTime();
                localStorage.setItem('userAchievements', JSON.stringify(achievementsData));
                return achievementsData;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        return null;
    }
}

// Function to fetch user goals from Firestore
async function fetchUserGoals(userId, forceRefresh = false) {
    try {
        const userGoalsRef = collection(db, 'users', userId, 'goals');
        const cachedUserGoals = JSON.parse(localStorage.getItem('userGoals'));

        if (!forceRefresh && cachedUserGoals) {
            const userGoalsSnapshot = await getDocs(userGoalsRef);

            if (!userGoalsSnapshot.empty) {
                let shouldUpdate = false;
                const goalsData = {};

                userGoalsSnapshot.forEach(doc => {
                    const serverGoal = doc.data();
                    const serverLastUpdated = serverGoal.lastUpdated.toMillis();
                    const cachedGoal = cachedUserGoals[doc.id];

                    if (!cachedGoal || serverLastUpdated > cachedGoal.lastUpdated) {
                        goalsData[doc.id] = serverGoal;
                        goalsData[doc.id].lastUpdated = serverLastUpdated;
                        shouldUpdate = true;
                    } else {
                        goalsData[doc.id] = cachedGoal;
                    }
                });

                if (shouldUpdate) {
                    localStorage.setItem('userGoals', JSON.stringify(goalsData));
                }

                return goalsData;
            } else {
                localStorage.removeItem('userGoals');
                return null;
            }
        } else {
            const userGoalsSnapshot = await getDocs(userGoalsRef);

            if (!userGoalsSnapshot.empty) {
                const goalsData = {};
                userGoalsSnapshot.forEach(doc => {
                    goalsData[doc.id] = doc.data();
                    goalsData[doc.id].lastUpdated = goalsData[doc.id].lastUpdated.toMillis();
                });
                localStorage.setItem('userGoals', JSON.stringify(goalsData));
                return goalsData;
            } else {
                localStorage.removeItem('userGoals');
                return null;
            }
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
            ? query(userRecommendationsRef, where('lastUpdated', '>', new Date(parseInt(lastCachedTimestamp))))
            : userRecommendationsRef;
        const userRecommendationsSnapshot = await getDocs(userRecommendationsQuery);

        if (!userRecommendationsSnapshot.empty) {
            const recommendationsData = {};
            userRecommendationsSnapshot.forEach(doc => {
                recommendationsData[doc.id] = doc.data();
            });
            localStorage.setItem('userRecommendations', JSON.stringify(recommendationsData));
            localStorage.setItem('userRecommendationsLastCachedTimestamp', new Date().getTime().toString());
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
            ? query(userStatisticsRef, where('lastUpdated', '>', new Date(parseInt(lastCachedTimestamp))))
            : userStatisticsRef;
        const userStatisticsSnapshot = await getDocs(userStatisticsQuery);

        if (!userStatisticsSnapshot.empty) {
            const statisticsData = {};
            userStatisticsSnapshot.forEach(doc => {
                statisticsData[doc.id] = doc.data();
            });
            localStorage.setItem('userStatistics', JSON.stringify(statisticsData));
            localStorage.setItem('userStatisticsLastCachedTimestamp', new Date().getTime().toString());
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
        const cachedUserProfile = JSON.parse(localStorage.getItem('profileData'));

        const userProfileSnapshot = await getDoc(userProfileRef);

        if (userProfileSnapshot.exists()) {
            const serverUserProfile = userProfileSnapshot.data();
            const serverLastUpdated = serverUserProfile.lastUpdated.toMillis();

            if (!cachedUserProfile || serverLastUpdated > cachedUserProfile.lastUpdated) {
                serverUserProfile.lastUpdated = serverLastUpdated;
                localStorage.setItem('profileData', JSON.stringify(serverUserProfile));
                return serverUserProfile;
            } else {
                return cachedUserProfile;
            }
        } else {
            console.log('User profile document does not exist');
            localStorage.removeItem('profileData');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Functions to modify user data in Firestore
async function addGoal(userId, goalType, goalAmount) {
    const userGoalsRef = collection(db, 'users', userId, 'goals');
    const userGoalsSnapshot = await getDocs(userGoalsRef);

    if (userGoalsSnapshot.size < 3) {
        const newGoalData = {
            description: goalType,
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            target: goalAmount,
            progress: 0,
            lastUpdated: serverTimestamp()
        };

        await addDoc(userGoalsRef, newGoalData);
        // fetchUserGoals(userId, true);
    } else {
        throw new Error('You have reached the maximum number of goals (3).');
    }
}

async function removeGoal(userId, goalId) {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalRef);
    // fetchUserGoals(userId, true);
}

async function saveSettings(userId, settings) {
    try {
        const userSettingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
        const currentSettings = (await getDoc(userSettingsRef)).data() || {};
        const updatedSettings = { ...currentSettings, ...settings, lastUpdated: serverTimestamp() };

        await updateDoc(userSettingsRef, updatedSettings);

        const localSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
        const updatedLocalSettings = { ...localSettings, ...settings, lastUpdated: new Date().getTime() };
        localStorage.setItem('userSettings', JSON.stringify(updatedLocalSettings));

        return 'Settings saved successfully.';
    } catch (error) {
        console.error('Error saving settings:', error);
        return 'Error saving settings. Please try again.';
    }
}

async function saveProfile(userId, profileData) {
    try {
        const userProfileRef = doc(db, 'users', userId, 'profile', 'profileData');
        const currentProfile = (await getDoc(userProfileRef)).data() || {};
        const updatedProfile = { ...currentProfile, ...profileData, lastUpdated: serverTimestamp() };

        await updateDoc(userProfileRef, updatedProfile);

        if (profileData.email && profileData.email !== currentProfile.email) {
            await auth.currentUser.verifyBeforeUpdateEmail(profileData.email);
        }

        const localProfile = JSON.parse(localStorage.getItem('profileData')) || {};
        const updatedLocalProfile = { ...localProfile, ...profileData, lastUpdated: new Date().getTime() };
        localStorage.setItem('profileData', JSON.stringify(updatedLocalProfile));

        return 'Profile updated successfully.';
    } catch (error) {
        console.error('Error updating profile:', error);
        return 'Error updating profile. Please try again.';
    }
}

async function saveFeedback(feedbackData) {
    try {
        const feedbackRef = collection(db, 'feedback');
        await addDoc(feedbackRef, feedbackData);
        return 'success';
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return error;
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
    addGoal,
    removeGoal,
    saveSettings,
    saveProfile,
    saveFeedback,
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp
};