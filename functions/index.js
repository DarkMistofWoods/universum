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

admin.initializeApp();

const db = admin.firestore();

exports.initializeUserProgressOnSignUp = functions.auth.user().onCreate(async (user) => {
    try {
        console.log('initializeUserProgressOnSignUp triggered for user:', user.uid);

        const userDocRef = db.collection('users').doc(user.uid);

        await userDocRef.set({});

        const courseContent = await fetchCourseContent();
        const currentTimestamp = admin.firestore.FieldValue.serverTimestamp();

        for (const module of courseContent) {
            for (const subModule of module.subModules) {
                for (const lesson of subModule.lessons) {
                    const lessonData = {
                        completed: false,
                        quizScores: [],
                        lastAccessed: currentTimestamp,
                        timeSpent: 0,
                        lastUpdated: currentTimestamp
                    };

                    await db.collection('users').doc(user.uid).collection('progress').doc(lesson.lessonId).set(lessonData);
                }
            }
        }

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
            recommendation1: {
                lessonId: 'Vocabulary_1_1',
                recommendedOn: currentTimestamp,
                pageUrl: '/knowledge/vocabulary/level1/lesson-1.html',
                reason: 'Start with vocabulary',
                lastUpdated: currentTimestamp
            }
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
            learningPath: 'default',
            notificationSettings: 'weekly',
            privacySettings: 'default',
            lastUpdated: currentTimestamp
        };

        await db.collection('users').doc(user.uid).collection('settings').doc('userSettings').set(defaultSettings);

        const defaultStatistics = {
            topicId: '',
            strengthScore: 0,
            quizScore: 0,
            totalTimeSpent: 0,
            learningRate: 0,
            difficultyRating: 0,
            engagementScore: 0,
            lastUpdated: currentTimestamp
        };

        await db.collection('users').doc(user.uid).collection('statistics').doc('overall').set(defaultStatistics);
    } catch (error) {
        console.error('Error initializing user progress:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

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