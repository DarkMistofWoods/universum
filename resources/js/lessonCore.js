import { db, completeLesson } from './firebase-config.js';

let strengthScore = 0;
let quizScores = [];
let totalTimeSpent = 0;
let engagementScore = 0;
let difficultyRating = 0;
let frequentlyMissedTopics = [];

function initLesson(lessonId, difficulty) {
    difficultyRating = difficulty;
    // Initialize other lesson-specific data if needed
}

function updateStrengthScore(score) {
    strengthScore = score;
}

function addQuizScore(score) {
    quizScores.push(score);
}

function updateTotalTimeSpent(time) {
    totalTimeSpent += time;
}

function updateEngagementScore(score) {
    engagementScore = score;
}

function updateFrequentlyMissedTopics(topic, missed) {
    if (missed) {
        if (!frequentlyMissedTopics.includes(topic)) {
            frequentlyMissedTopics.push(topic);
        }
    } else {
        const index = frequentlyMissedTopics.indexOf(topic);
        if (index !== -1) {
            frequentlyMissedTopics.splice(index, 1);
        }
    }
}

async function finishLesson(lessonId, userId) {
    const averageQuizScore = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
    const learningPace = await getUserLearningPace(userId);

    const lessonData = {
        strengthScore,
        quizScores,
        totalTimeSpent,
        engagementScore,
        difficultyRating,
        averageQuizScore,
        learningPace,
        frequentlyMissedTopics
    };

    await completeLesson(lessonId, userId, lessonData);

    // Pass the lessonData to the ML model (placeholder for now)
    // const recommendedLessons = await recommendNextLessons(lessonData);
    // Process the recommended lessons as needed
}

async function getUserLearningPace(userId) {
    const userSettingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
    const userSettingsSnapshot = await getDoc(userSettingsRef);

    if (userSettingsSnapshot.exists()) {
        const userSettings = userSettingsSnapshot.data();
        const learningPace = userSettings.learningPace;

        switch (learningPace) {
            case 'slow':
                return 0.25;
            case 'medium':
                return 0.5;
            case 'fast':
                return 0.75;
            default:
                return 0.5; // Default to medium if not set
        }
    } else {
        return 0.5; // Default to medium if settings don't exist
    }
}

export { initLesson, updateStrengthScore, addQuizScore, updateTotalTimeSpent, updateEngagementScore, updateFrequentlyMissedTopics, finishLesson };