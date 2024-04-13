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
        const progressData = {};

        for (const module of courseContent) {
            progressData[module.moduleId] = {
                moduleProgress: 0,
                subModules: {}
            };

            for (const subModule of module.subModules) {
                progressData[module.moduleId].subModules[subModule.subModuleId] = {
                    subModuleProgress: 0,
                    lessons: {}
                };

                for (const lesson of subModule.lessons) {
                    progressData[module.moduleId].subModules[subModule.subModuleId].lessons[lesson.title] = {
                        completed: false,
                        recentQuizScores: []
                    };
                }
            }
        }

        const userProgressData = {
            progressData: progressData,
            achievementsData: [
                { name: 'Complete 10 lessons', progress: 0 },
                { name: 'Learn 20 words', progress: 0 },
                { name: 'Score 100% on three separate quizzes', progress: 0 }
            ],
            recommendationsData: {
                recommendation1: {
                    title: 'Start with vocabulary',
                    description: 'Learn the commonly used words first.',
                    link: '#'
                }
            },
            goalsData: [
                {
                    title: 'Complete 10 lessons',
                    progress: 0,
                    target: 10
                }
            ]
        };

        await db.collection('userProgress').doc(user.uid).set(userProgressData);
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