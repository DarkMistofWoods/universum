import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

async function createVisualization(courseContent, userProgress) {
    const progress = calculateProgress(courseContent, userProgress);
    console.log(progress);
    // Create the visualization using the progress data
}

function calculateProgress(courseContent, userProgress) {
    const progressData = {
        modules: {},
        subModules: {},
        lessons: userProgress,
    };

    courseContent.forEach((module) => {
        const moduleId = module.moduleId;
        let moduleProgress = 0;
        let moduleQuizScore = 0;

        module.subModules.forEach((subModule) => {
            const subModuleId = subModule.subModuleId;
            let subModuleProgress = 0;
            let subModuleQuizScore = 0;

            subModule.lessons.forEach((lesson) => {
                const lessonId = lesson.lessonId;
                const lessonProgress = userProgress[lessonId]?.completed ? 1 : 0;
                const lessonQuizScore = userProgress[lessonId]?.quizScores?.reduce((sum, score) => sum + score, 0) || 0;
                const lessonQuizCount = userProgress[lessonId]?.quizScores?.length || 0;

                subModuleProgress += lessonProgress;
                subModuleQuizScore += lessonQuizCount > 0 ? lessonQuizScore / lessonQuizCount : 0;
            });

            subModuleProgress /= subModule.lessons.length;
            subModuleQuizScore /= subModule.lessons.length;

            progressData.subModules[subModuleId] = {
                progress: subModuleProgress,
                quizScore: subModuleQuizScore,
            };

            moduleProgress += subModuleProgress;
            moduleQuizScore += subModuleQuizScore;
        });

        moduleProgress /= module.subModules.length;
        moduleQuizScore /= module.subModules.length;

        progressData.modules[moduleId] = {
            progress: moduleProgress,
            quizScore: moduleQuizScore,
        };
    });

    return progressData;
}

async function loadCourseContent() {
    const response = await fetch('functions/courseContent.json');
    return await response.json();
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            initializeVisualization(user);
        } else {
            // User is signed out
            console.log('User is signed out');
            // Redirect to login page or show login prompt
            window.location.href = '/login.html';
        }
    });
}

// Call the main function when the page loads
window.addEventListener('DOMContentLoaded', checkAuthState);