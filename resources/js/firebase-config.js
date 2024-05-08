// Import the functions needed from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
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

async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        localStorage.clear();
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        window.location.href = '/login.html';
    }
}

// Function to handle user signup
async function handleSignup(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
}

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
        const cachedUserProgress = JSON.parse(localStorage.getItem('userProgress')) || {};

        const userProgressSnapshot = await getDocs(userProgressRef);

        if (!userProgressSnapshot.empty) {
            let updatedLessons = {};

            userProgressSnapshot.forEach(doc => {
                const serverLesson = doc.data();
                const serverLastUpdated = serverLesson.lastUpdated.toMillis();
                const cachedLesson = cachedUserProgress[doc.id];

                if (!cachedLesson || serverLastUpdated > cachedLesson.lastUpdated) {
                    updatedLessons[doc.id] = { ...serverLesson, lastUpdated: serverLastUpdated };
                }
            });

            if (Object.keys(updatedLessons).length > 0) {
                const updatedUserProgress = { ...cachedUserProgress, ...updatedLessons };
                localStorage.setItem('userProgress', JSON.stringify(updatedUserProgress));
                return updatedUserProgress;
            }

            return cachedUserProgress;
        } else {
            return cachedUserProgress;
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
        const cachedUserAchievements = JSON.parse(localStorage.getItem('userAchievements')) || {};

        const userAchievementsSnapshot = await getDocs(userAchievementsRef);

        if (!userAchievementsSnapshot.empty) {
            let shouldUpdate = false;
            const achievementsData = {};

            userAchievementsSnapshot.forEach(doc => {
                const serverAchievement = doc.data();
                const serverLastUpdated = serverAchievement.lastUpdated.toMillis();
                const cachedAchievement = cachedUserAchievements[doc.id];

                if (!cachedAchievement || serverLastUpdated > cachedAchievement.lastUpdated) {
                    achievementsData[doc.id] = serverAchievement;
                    achievementsData[doc.id].lastUpdated = serverLastUpdated;
                    shouldUpdate = true;
                } else {
                    achievementsData[doc.id] = cachedAchievement;
                }
            });

            if (shouldUpdate) {
                localStorage.setItem('userAchievements', JSON.stringify(achievementsData));
            }

            return achievementsData;
        } else {
            return cachedUserAchievements;
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
        const cachedUserRecommendations = JSON.parse(localStorage.getItem('userRecommendations')) || {};

        const userRecommendationsSnapshot = await getDocs(userRecommendationsRef);

        if (!userRecommendationsSnapshot.empty) {
            let shouldUpdate = false;
            const recommendationsData = {};

            userRecommendationsSnapshot.forEach(doc => {
                const serverRecommendation = doc.data();
                const serverLastUpdated = serverRecommendation.lastUpdated.toMillis();
                const cachedRecommendation = cachedUserRecommendations[doc.id];

                if (!cachedRecommendation || serverLastUpdated > cachedRecommendation.lastUpdated) {
                    recommendationsData[doc.id] = serverRecommendation;
                    recommendationsData[doc.id].lastUpdated = serverLastUpdated;
                    shouldUpdate = true;
                } else {
                    recommendationsData[doc.id] = cachedRecommendation;
                }
            });

            if (shouldUpdate) {
                localStorage.setItem('userRecommendations', JSON.stringify(recommendationsData));
            }

            return recommendationsData;
        } else {
            return cachedUserRecommendations;
        }
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
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

// Function to fetch challenges from Firestore, implement local saving/updating
async function fetchChallenges() {
    try {
        const challengesRef = collection(db, 'challenges');
        const challengesSnapshot = await getDocs(challengesRef);

        if (!challengesSnapshot.empty) {
            const challengesData = {};
            challengesSnapshot.forEach(doc => {
                challengesData[doc.id] = doc.data();
            });
            return challengesData;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching challenges:', error);
        return null;
    }
}

// Function to submit a challenge answer
async function submitChallengeAnswer(challengeId, userId, answer) {
    try {
        const answerRef = collection(db, 'challenges', challengeId, 'answers');
        await addDoc(answerRef, {
            userId: userId,
            answer: answer,
            votes: 0,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error submitting challenge answer:', error);
        throw error;
    }
}

// Function to vote for a challenge answer
async function voteChallengeAnswer(challengeId, answerId, userId) {
    try {
        const answerRef = doc(db, 'challenges', challengeId, 'answers', answerId);
        const answerDoc = await getDoc(answerRef);

        if (answerDoc.exists()) {
            const voteRef = collection(answerRef, 'votes');
            const userVoteQuery = query(voteRef, where('userId', '==', userId));
            const userVoteSnapshot = await getDocs(userVoteQuery);

            if (userVoteSnapshot.empty) {
                await addDoc(voteRef, { userId: userId });
                await updateDoc(answerRef, { votes: answerDoc.data().votes + 1 });
            } else {
                console.log('User has already voted for this answer');
            }
        } else {
            console.log('Answer document does not exist');
        }
    } catch (error) {
        console.error('Error voting for challenge answer:', error);
        throw error;
    }
}

async function completeLesson(lessonId, userId, lessonData) {
    try {
        const lessonRef = doc(db, 'users', userId, 'progress', lessonId);
        await updateDoc(lessonRef, {
            strengthScore: lessonData.strengthScore,
            quizScores: lessonData.quizScores,
            totalTimeSpent: lessonData.totalTimeSpent,
            engagementScore: lessonData.engagementScore,
            completed: true,
            lastUpdated: serverTimestamp()
        });

        const statisticsRef = doc(db, 'users', userId, 'statistics', 'overall');
        const statisticsSnapshot = await getDoc(statisticsRef);

        if (statisticsSnapshot.exists()) {
            const statisticsData = statisticsSnapshot.data();
            const frequentlyMissedTopics = [...(statisticsData.frequentlyMissedTopics || []), ...lessonData.frequentlyMissedTopics];
            await updateDoc(statisticsRef, {
                frequentlyMissedTopics,
                lastUpdated: serverTimestamp()
            });
        } else {
            await setDoc(statisticsRef, {
                frequentlyMissedTopics: lessonData.frequentlyMissedTopics,
                lastUpdated: serverTimestamp()
            });
        }

        console.log('Lesson completed successfully');
    } catch (error) {
        console.error('Error completing lesson:', error);
        throw error;
    }
}

export {
    db,
    auth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    handleLogin,
    handleLogout,
    handleSignup,
    fetchUserSettings,
    fetchUserProgress,
    fetchUserAchievements,
    fetchUserGoals,
    fetchUserRecommendations,
    fetchUserProfile,
    addGoal,
    removeGoal,
    saveSettings,
    saveProfile,
    saveFeedback,
    fetchChallenges,
    submitChallengeAnswer,
    voteChallengeAnswer,
    completeLesson,
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp
};