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

        const courseContent = await fetchCourseContent();

        for (const module of courseContent) {
            for (const subModule of module.subModules) {
                for (const lesson of subModule.lessons) {
                    const lessonData = {
                        completed: false,
                        quizScores: [],
                        lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
                        timeSpent: 0
                    };

                    await db.collection('users').doc(user.uid).collection('progress').doc(lesson.lessonId).set(lessonData);
                }
            }
        }

        const defaultAchievements = [
            { type: 'login', title: 'Log in to your account for the first time', progress: 1, target: 1, lastUpdated: admin.firestore.FieldValue.serverTimestamp() }
        ];

        for (const achievement of defaultAchievements) {
            await db.collection('users').doc(user.uid).collection('achievements').add(achievement);
        }

        const defaultRecommendations = {
            recommendation1: {
                lessonId: 'Lesson_1_1',
                recommendedOn: admin.firestore.FieldValue.serverTimestamp(),
                reason: 'Start with vocabulary'
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
                progress: 0
            }
        ];

        for (const goal of defaultGoals) {
            await db.collection('users').doc(user.uid).collection('goals').add(goal);
        }
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