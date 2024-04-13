import { db, auth } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Function to fetch user progress data from Firestore
async function fetchUserProgress(userId) {
    try {
        const userProgressRef = doc(db, 'userProgress', userId);
        const userProgressSnapshot = await getDoc(userProgressRef);

        if (userProgressSnapshot.exists()) {
            const userData = userProgressSnapshot.data();
            const progressData = userData.progressData;
            const achievementsData = userData.achievementsData || [];
            const recommendationsData = userData.recommendationsData || {};
            const goalsData = userData.goalsData || [];

            updateProgressTracker(progressData);
            updateRecentAchievements(achievementsData);
            updateRecommendations(recommendationsData);
            updateLearningGoals(goalsData);
        } else {
            console.log('User progress document does not exist');
            updateProgressTracker(null);
            updateRecentAchievements(null);
            updateRecommendations(null);
            updateLearningGoals(null);
        }
    } catch (error) {
        console.error('Error fetching user progress:', error);
        updateProgressTracker(null);
        updateRecentAchievements(null);
        updateRecommendations(null);
        updateLearningGoals(null);
    }
}

// Function to handle user authentication state changes
function handleAuthStateChanged(user) {
    if (user) {
        const userId = user.uid;
        fetchUserProgress(userId);
    } else {
        console.log('User is not authenticated');
        window.location.href = '/login.html';
        // Handle the case when user is not authenticated
    }
}

// Listen for user authentication state changes
auth.onAuthStateChanged(handleAuthStateChanged);

// Functions to update the dashboard widgets with real or demo data
function updateProgressTracker(progressData) {
    const progressTrackerContainer = document.querySelector('.progress-tracker .content');
    progressTrackerContainer.innerHTML = '<h3>Current Progress</h3>';

    if (progressData) {
        for (const [moduleId, moduleData] of Object.entries(progressData)) {
            const completedLessonsInModule = getCompletedLessonsInModule(moduleData);
            if (completedLessonsInModule.length > 0) {
                const moduleElement = createModuleProgressElement(moduleId, moduleData);
                progressTrackerContainer.appendChild(moduleElement);

                for (const [subModuleId, subModuleData] of Object.entries(moduleData.subModules)) {
                    const completedLessonsInSubModule = getCompletedLessonsInSubModule(subModuleData);
                    if (completedLessonsInSubModule.length > 0) {
                        const subModuleElement = createSubModuleProgressElement(subModuleId, subModuleData);
                        progressTrackerContainer.appendChild(subModuleElement);

                        for (const [lessonTitle, lessonData] of Object.entries(subModuleData.lessons)) {
                            if (lessonData.completed) {
                                const lessonElement = createLessonProgressElement(lessonTitle, lessonData);
                                progressTrackerContainer.appendChild(lessonElement);
                            }
                        }
                    }
                }
            }
        }
    } else {
        progressTrackerContainer.innerHTML = '<p>No progress data available.</p>';
    }
}

function getCompletedLessonsInModule(moduleData) {
    const completedLessons = [];
    for (const subModuleData of Object.values(moduleData.subModules)) {
        completedLessons.push(...getCompletedLessonsInSubModule(subModuleData));
    }
    return completedLessons;
}

function getCompletedLessonsInSubModule(subModuleData) {
    return Object.entries(subModuleData.lessons)
        .filter(([, lessonData]) => lessonData.completed)
        .map(([lessonTitle]) => lessonTitle);
}

function createModuleProgressElement(moduleId, moduleData) {
    const moduleProgress = calculateModuleProgress(moduleData);
    const currentModule = moduleId;

    const moduleElement = document.createElement('div');
    moduleElement.classList.add('module');
    const moduleTitleElement = document.createElement('h4');
    moduleTitleElement.textContent = currentModule;
    const moduleProgressElement = document.createElement('div');
    moduleProgressElement.classList.add('progress-bar');
    const moduleProgressIndicatorElement = document.createElement('div');
    moduleProgressIndicatorElement.classList.add('progress');
    moduleProgressIndicatorElement.style.width = `${moduleProgress}%`;
    moduleProgressElement.appendChild(moduleProgressIndicatorElement);
    moduleElement.appendChild(moduleTitleElement);
    moduleElement.appendChild(moduleProgressElement);

    return moduleElement;
}

function createSubModuleProgressElement(subModuleId, subModuleData) {
    const submoduleProgress = calculateSubModuleProgress(subModuleData);
    const currentSubmodule = subModuleId;
    
    const submoduleElement = document.createElement('div');
    submoduleElement.classList.add('submodule');
    const submoduleTitleElement = document.createElement('h4');
    submoduleTitleElement.textContent = currentSubmodule;
    const submoduleProgressElement = document.createElement('div');
    submoduleProgressElement.classList.add('progress-bar');
    const submoduleProgressIndicatorElement = document.createElement('div');
    submoduleProgressIndicatorElement.classList.add('progress');
    submoduleProgressIndicatorElement.style.width = `${submoduleProgress}%`;
    submoduleProgressElement.appendChild(submoduleProgressIndicatorElement);
    submoduleElement.appendChild(submoduleTitleElement);
    submoduleElement.appendChild(submoduleProgressElement);

    return submoduleElement;
}

function createLessonProgressElement(lessonTitle, lessonData) {
    const currentLesson = lessonTitle;
    const lessonProgress = lessonData.completed ? 100 : 0;

    const lessonElement = document.createElement('div');
    lessonElement.classList.add('lesson');
    const lessonTitleElement = document.createElement('h4');
    lessonTitleElement.textContent = currentLesson;
    const lessonProgressElement = document.createElement('div');
    lessonProgressElement.classList.add('progress-bar');
    const lessonProgressIndicatorElement = document.createElement('div');
    lessonProgressIndicatorElement.classList.add('progress');
    lessonProgressIndicatorElement.style.width = `${lessonProgress}%`;
    lessonProgressElement.appendChild(lessonProgressIndicatorElement);
    lessonElement.appendChild(lessonTitleElement);
    lessonElement.appendChild(lessonProgressElement);

    return lessonElement;
}

function calculateModuleProgress(moduleData) {
    const totalSubModules = Object.keys(moduleData.subModules).length;
    const completedSubModules = Object.values(moduleData.subModules).filter(subModule => subModule.subModuleProgress === 100).length;
    return (completedSubModules / totalSubModules) * 100;
}

function calculateSubModuleProgress(subModuleData) {
    const totalLessons = Object.keys(subModuleData.lessons).length;
    const completedLessons = Object.values(subModuleData.lessons).filter(lesson => lesson.completed).length;
    return (completedLessons / totalLessons) * 100;
}

function updateRecentAchievements(achievementsData) {
    const recentAchievementsContainer = document.querySelector('.recent-achievements .content');

    // Clear the previous content
    recentAchievementsContainer.innerHTML = '<h3>Recent Achievements</h3>';

    // Check if the achievements data is available
    if (achievementsData) {
        // Update the recent achievements widget with the real data
        for (const achievement of achievementsData) {
            const achievementElement = createAchievementElement(achievement);
            recentAchievementsContainer.appendChild(achievementElement);
        }
    } else {
        // Display placeholder data
        const placeholderAchievements = [
            { name: 'Achievement 1', progress: 60 },
            { name: 'Achievement 2', progress: 80 },
            { name: 'Achievement 3', progress: 40 },
        ];

        for (const achievement of placeholderAchievements) {
            const achievementElement = createAchievementElement(achievement);
            recentAchievementsContainer.appendChild(achievementElement);
        }
    }
}

function createAchievementElement(achievement) {
    const achievementElement = document.createElement('div');
    achievementElement.classList.add('achievement');

    const nameElement = document.createElement('h4');
    nameElement.textContent = achievement.name;

    const progressBarElement = document.createElement('div');
    progressBarElement.classList.add('progress-bar');

    const progressElement = document.createElement('div');
    progressElement.classList.add('progress');
    progressElement.style.width = `${achievement.progress}%`;

    progressBarElement.appendChild(progressElement);

    achievementElement.appendChild(nameElement);
    achievementElement.appendChild(progressBarElement);

    return achievementElement;
}

function updateRecommendations(recommendationsData) {
    const recommendationsContainer = document.querySelector('.recommendations .content');
    recommendationsContainer.innerHTML = '<h3>Adaptive Learning Recommendations</h3>';

    if (recommendationsData) {
        for (const recommendation of Object.values(recommendationsData)) {
            const recommendationElement = createRecommendationElement(recommendation);
            recommendationsContainer.appendChild(recommendationElement);
        }
    } else {
        recommendationsContainer.innerHTML = '<p>No recommendations available.</p>';
    }
}

function createRecommendationElement(recommendation) {
    const recommendationElement = document.createElement('div');
    recommendationElement.classList.add('recommendation');

    const titleElement = document.createElement('h3');
    titleElement.textContent = recommendation.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = recommendation.description;

    const linkElement = document.createElement('a');
    linkElement.href = recommendation.pageUrl;
    linkElement.classList.add('recommendation-link');
    linkElement.textContent = 'Go to Lesson';

    recommendationElement.appendChild(titleElement);
    recommendationElement.appendChild(descriptionElement);
    recommendationElement.appendChild(linkElement);

    return recommendationElement;
}

function updateLearningGoals(goalsData) {
    // Get a reference to the learning goals container
    const learningGoalsContainer = document.querySelector('.learning-goals .content');

    // Clear the previous content
    learningGoalsContainer.innerHTML = '<h3>Your Learning Goals</h3>';

    // Check if the goals data is available
    if (goalsData) {
        // Update the learning goals widget with the real data
        for (const goal of Object.values(goalsData)) {
            const goalElement = createLearningGoalElement(goal);
            learningGoalsContainer.appendChild(goalElement);
        }
    } else {
        // Display demo data if the back-end is not accessible
        const demoGoals = [
            {
                title: 'Learn 50 new vocabulary words',
                progress: 30,
                target: 50
            },
            {
                title: 'Complete 10 grammar lessons',
                progress: 7,
                target: 10
            },
            {
                title: 'Achieve a 90% average on quizzes',
                progress: 85,
                target: 100
            }
        ];

        for (const goal of demoGoals) {
            const goalElement = createLearningGoalElement(goal);
            learningGoalsContainer.appendChild(goalElement);
        }
    }
}

function createLearningGoalElement(goal) {
    const goalElement = document.createElement('div');
    goalElement.classList.add('learning-goal');

    const titleElement = document.createElement('h3');
    titleElement.textContent = goal.title;

    const progressTextElement = document.createElement('div');
    progressTextElement.classList.add('progress-text');
    progressTextElement.textContent = `${goal.progress} / ${goal.target}`;

    const progressBarElement = document.createElement('div');
    progressBarElement.classList.add('progress-bar');

    const progressElement = document.createElement('div');
    progressElement.classList.add('progress');
    progressElement.style.width = `${(goal.progress / goal.target) * 100}%`;

    progressBarElement.appendChild(progressElement);

    goalElement.appendChild(titleElement);
    goalElement.appendChild(progressTextElement);
    goalElement.appendChild(progressBarElement);

    return goalElement;
}