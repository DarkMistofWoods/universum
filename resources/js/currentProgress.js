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
    const progressData = courseContent.map((module) => ({
        ...module,
        progress: 0,
        quizScore: 0,
        subModules: module.subModules.map((subModule) => ({
            ...subModule,
            progress: 0,
            quizScore: 0,
            lessons: subModule.lessons.map((lesson) => {
                const lessonProgress = userProgress[lesson.lessonId]?.completed ? 1 : 0;
                const lessonQuizScores = userProgress[lesson.lessonId]?.quizScores || [];
                const lessonQuizScore = lessonQuizScores.length > 0 ? lessonQuizScores.reduce((sum, score) => sum + score, 0) / lessonQuizScores.length : 0;

                return {
                    ...lesson,
                    progress: lessonProgress,
                    quizScore: lessonQuizScore,
                };
            }),
        })),
    }));

    progressData.forEach((module) => {
        let moduleProgress = 0;
        let moduleQuizScore = 0;

        module.subModules.forEach((subModule) => {
            let subModuleProgress = 0;
            let subModuleQuizScore = 0;

            subModule.lessons.forEach((lesson) => {
                subModuleProgress += lesson.progress;
                subModuleQuizScore += lesson.quizScore;
            });

            subModuleProgress /= subModule.lessons.length;
            subModuleQuizScore /= subModule.lessons.length;

            subModule.progress = subModuleProgress;
            subModule.quizScore = subModuleQuizScore;

            moduleProgress += subModuleProgress;
            moduleQuizScore += subModuleQuizScore;
        });

        moduleProgress /= module.subModules.length;
        moduleQuizScore /= module.subModules.length;

        module.progress = moduleProgress;
        module.quizScore = moduleQuizScore;
    });

    return progressData;
    /* the progressData object will look like this:

    [
        {
            moduleName: 'Module 1',
            moduleId: 'moduleId1',
            progress: 0.75,
            quizScore: 0.85,
            subModules: [
                {
                    subModuleName: 'Submodule 1',
                    subModuleId: 'subModuleId1',
                    progress: 0.8,
                    quizScore: 0.9,
                    lessons: [
                        {
                            title: 'Lesson 1',
                            lessonId: 'lessonId1',
                            progress: 1,
                            quizScore: 0.95,
                        },
                        // ...
                    ],
                },
                // ...
            ],
        },
        // ...
    ]
    
    */
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