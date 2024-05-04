/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const ml = admin.machineLearning();

admin.initializeApp();

const db = admin.firestore();

exports.initializeUserProgressOnSignUp = functions.auth.user().onCreate(async (user) => {
    try {
        console.log('initializeUserProgressOnSignUp triggered for user:', user.uid);

        const userDocRef = db.collection('users').doc(user.uid);

        await userDocRef.set({});

        const currentTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const lessonData = {
            completed: false,
            quizScores: [],
            lastUpdated: currentTimestamp
        };

        await db.collection('users').doc(user.uid).collection('progress').doc('Vocabulary_1_1').set(lessonData);

        const initialAchievementDoc = await db.collection('achievements').doc('achievement1').get();

        if (initialAchievementDoc.exists) {
            const initialAchievementData = initialAchievementDoc.data();

            await db.collection('users').doc(user.uid).collection('achievements').doc('achievement1').set({
                type: initialAchievementData.type,
                title: initialAchievementData.title,
                progress: 1,
                target: initialAchievementData.target,
                lastUpdated: currentTimestamp
            });
        } else {
            console.warn('Default achievement document not found.');
        }

        const defaultRecommendations = {
            /*
            recommendation1: {
                lessonId: 'Vocabulary_1_1',
                recommendedOn: currentTimestamp,
                pageUrl: '/knowledge/vocabulary/level1/lesson-1.html',
                reason: 'Start with vocabulary',
                lastUpdated: currentTimestamp
            }
            */
        };

        for (const [recommendationId, recommendationData] of Object.entries(defaultRecommendations)) {
            await db.collection('users').doc(user.uid).collection('recommendations').doc(recommendationId).set(recommendationData);
        }

        const defaultGoals = [
            {
                description: 'completeLessons',
                targetDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                target: 10,
                progress: 0,
                lastUpdated: currentTimestamp
            }
        ];

        for (const goal of defaultGoals) {
            await db.collection('users').doc(user.uid).collection('goals').add(goal);
        }

        const defaultProfile = {
            displayName: user.displayName || 'New User',
            location: '',
            email: user.email || '',
            lastUpdated: currentTimestamp
        };

        await db.collection('users').doc(user.uid).collection('profile').doc('profileData').set(defaultProfile);

        const defaultSettings = {
            audioSpeed: 'normal',
            contentPreferences: ['vocabulary', 'grammar', 'cultural', 'pronunciation'],
            feedbackFrequency: 'weekly',
            languageInterface: 'english',
            learningPace: 'medium',
            learningPath: 'guided',
            notificationSettings: 'weekly',
            privacySettings: 'private',
            lastUpdated: currentTimestamp
        };

        await db.collection('users').doc(user.uid).collection('settings').doc('userSettings').set(defaultSettings);

        const defaultStatistics = {
            strengthScore: 0,
            quizScore: 0,
            totalTimeSpent: 0,
            learningRate: 0,
            difficultyRating: 0,
            engagementScore: 0
        };

        await db.collection('users').doc(user.uid).collection('progress').doc('Vocabulary_1_1').collection('statistics').doc('overall').set(defaultStatistics);
    } catch (error) {
        console.error('Error initializing user progress:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.compileGlobalStats = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {
    try {
        console.log('compileGlobalStats triggered');

        const db = admin.firestore();

        const publicUsersQuery = db.collectionGroup('settings')
            .where('privacySettings', '==', 'public')
            .limit(100);

        const publicUsersSnapshot = await publicUsersQuery.get();

        const globalStatsRef = db.collection('globalStats').doc('overall');

        await db.runTransaction(async (transaction) => {
            const globalStatsDoc = await transaction.get(globalStatsRef);

            let totalUsers = globalStatsDoc.data().totalUsers || 0;
            let totalLessonsCompleted = globalStatsDoc.data().totalLessonsCompleted || 0;

            for (const settingsDoc of publicUsersSnapshot.docs) {
                const userId = settingsDoc.ref.parent.parent.id;
                const progressSnapshot = await db.collection('users').doc(userId).collection('progress').get();

                totalUsers++;

                for (const progressDoc of progressSnapshot.docs) {
                    const lessonData = progressDoc.data();

                    if (lessonData.completed) {
                        totalLessonsCompleted++;
                    }

                    const lessonStatsRef = db.collection('globalStats').doc(progressDoc.id);
                    const lessonStatsDoc = await transaction.get(lessonStatsRef);

                    const averageQuizScore = lessonStatsDoc.data().averageQuizScore || 0;
                    const averageTimeSpent = lessonStatsDoc.data().averageTimeSpent || 0;
                    const totalCompleted = lessonStatsDoc.data().totalCompleted || 0;

                    const updatedQuizScore = (averageQuizScore * totalCompleted + lessonData.quizScores.reduce((a, b) => a + b, 0) / lessonData.quizScores.length) / (totalCompleted + 1);
                    const updatedTimeSpent = (averageTimeSpent * totalCompleted + lessonData.timeSpent) / (totalCompleted + 1);

                    transaction.set(lessonStatsRef, {
                        averageQuizScore: updatedQuizScore,
                        averageTimeSpent: updatedTimeSpent,
                        totalCompleted: totalCompleted + 1,
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            }

            transaction.set(globalStatsRef, {
                totalUsers: totalUsers,
                totalLessonsCompleted: totalLessonsCompleted,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        console.log('Global stats compiled successfully');
    } catch (error) {
        console.error('Error compiling global stats:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.updateRecommendations = functions.firestore
    .document('users/{userId}/progress/{lessonId}')
    .onUpdate(async (change, context) => {
        const lessonData = change.after.data();
        const userId = context.params.userId;
        const lessonId = context.params.lessonId;

        if (lessonData.completed) {
            try {
                const statisticsDoc = await admin.firestore().collection('users').doc(userId)
                    .collection('progress').doc(lessonId)
                    .collection('statistics').doc('overall').get();

                const statisticsData = statisticsDoc.data();

                // Get the deployed custom recommendation model from Firebase ML
                const model = ml.model('Recommender');

                // Prepare the input data for the model
                const inputData = {
                    lessonId: lessonId,
                    strengthScore: statisticsData.strengthScore,
                    quizScore: statisticsData.quizScore,
                    totalTimeSpent: statisticsData.totalTimeSpent,
                    learningRate: statisticsData.learningRate,
                    difficultyRating: statisticsData.difficultyRating,
                    engagementScore: statisticsData.engagementScore,
                    incorrectAnswers: statisticsData.incorrectAnswers,
                    frequentlyMissedTopics: statisticsData.frequentlyMissedTopics,
                    userFeedback: statisticsData.userFeedback
                };

                // Make predictions using the model
                const [recommendedLessonId] = await model.predict(inputData);

                // Map the recommended lesson ID to the corresponding page URL
                const pageUrl = getPageUrlFromLessonId(recommendedLessonId);
                
                // Generate a simple reason based on predefined rules or heuristics
                const reason = generateReasonForRecommendation(recommendedLessonId, statisticsData);

                // Process the generated recommendations
                const recommendationsToAdd = recommendations.map((recommendation) => ({
                    lessonId: recommendation.lessonId,
                    pageUrl: pageUrl,
                    reason: reason
                }));

                // Update the user's recommendations subcollection
                const recommendationsRef = admin.firestore().collection('users').doc(userId).collection('recommendations');
                const existingRecommendations = await recommendationsRef.get();

                const currentTimestamp = admin.firestore.FieldValue.serverTimestamp();

                const batch = admin.firestore().batch();

                recommendationsToAdd.slice(0, 3 - existingRecommendations.size).forEach((recommendation) => {
                    const recommendationRef = recommendationsRef.doc();
                    batch.set(recommendationRef, {
                        ...recommendation,
                        recommendedOn: currentTimestamp,
                        lastUpdated: currentTimestamp,
                    });
                });

                await batch.commit();

                console.log('Recommendations updated successfully for user:', userId);
            } catch (error) {
                console.error('Error updating recommendations:', error);
                throw new functions.https.HttpsError('internal', error.message);
            }
        }
    });

// Function to map lesson ID to page URL
function getPageUrlFromLessonId(lessonId) {
  // Define a mapping object that maps lesson IDs to their corresponding page URLs
  const lessonIdToPageUrlMap = {
    'lesson1': '/lessons/lesson1',
    'lesson2': '/lessons/lesson2',
    'lesson3': '/lessons/lesson3',
    // Add more mappings as needed
  };

  return lessonIdToPageUrlMap[lessonId] || '/lessons/default';
}

function generateReasonForRecommendation(lessonId, statisticsData) {

}

async function fetchCourseContent() {
    try {
        const courseContentPath = path.join(__dirname, './courseContent.json');
        console.log('Fetching course content from:', courseContentPath);
        const courseContentJson = await fs.promises.readFile(courseContentPath, 'utf-8');
        console.log('Course content JSON:', courseContentJson);
        return JSON.parse(courseContentJson);
    } catch (error) {
        console.error('Error fetching course content:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch course content.');
    }
}

async function fetchLexiconData() {
    try {
        const lexiconDataPath = path.join(__dirname, './lexiconData.json');
        console.log('Fetching lexicon data from:', lexiconDataPath);
        const lexiconDataJson = await fs.promises.readFile(lexiconDataPath, 'utf-8');
        console.log('Course lexicon JSON:', lexiconDataJson);
        return JSON.parse(lexiconDataJson);
    } catch (error) {
        console.error('Error fetching lexicon data:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch lexicon data.');
    }
}