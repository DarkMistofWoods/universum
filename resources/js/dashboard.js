import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Function to fetch user progress data from Firestore
async function fetchUserProgress(userId) {
    try {
        const userProgressRef = collection(db, 'users', userId, 'progress');
        const userProgressSnapshot = await getDocs(userProgressRef);
        //console.log('User Progress Snapshot:', userProgressSnapshot);

        const progressData = {};
        const achievementsData = [];
        const recommendationsData = {};
        const goalsData = [];

        if (!userProgressSnapshot.empty) {
            userProgressSnapshot.forEach((doc) => {
                const lessonId = doc.id;
                const lessonData = doc.data();
                progressData[lessonId] = lessonData;
            });
        }

        const userAchievementsRef = collection(db, 'users', userId, 'achievements');
        const userAchievementsSnapshot = await getDocs(userAchievementsRef);
        if (!userAchievementsSnapshot.empty) {
            userAchievementsSnapshot.forEach((doc) => {
                const achievementData = doc.data();
                achievementsData.push(achievementData);
            });
        }

        const userRecommendationsRef = collection(db, 'users', userId, 'recommendations');
        const userRecommendationsSnapshot = await getDocs(userRecommendationsRef);
        if (!userRecommendationsSnapshot.empty) {
            userRecommendationsSnapshot.forEach((doc) => {
                const recommendationId = doc.id;
                const recommendationData = doc.data();
                recommendationsData[recommendationId] = recommendationData;
            });
        }

        const userGoalsRef = collection(db, 'users', userId, 'goals');
        const userGoalsSnapshot = await getDocs(userGoalsRef);
        if (!userGoalsSnapshot.empty) {
            userGoalsSnapshot.forEach((doc) => {
                const goalData = doc.data();
                goalsData.push(goalData);
            });
        }

        updateProgressTracker(progressData);
        updateRecentAchievements(achievementsData);
        updateRecommendations(recommendationsData);
        updateLearningGoals(goalsData);
    } catch (error) {
        console.error('Error fetching user progress:', error);
        updateProgressTracker(null);
        updateRecentAchievements(null);
        updateRecommendations(null);
        updateLearningGoals(null);
    }
}

// Function to fetch user profile data from Firestore
async function fetchUserProfile(userId) {
    try {
        const userProfileRef = doc(db, 'users', userId, 'profile', 'profileData');
        const userProfileSnapshot = await getDoc(userProfileRef);

        if (userProfileSnapshot.exists()) {
            const userProfileData = userProfileSnapshot.data();
            updateDisplayName(userProfileData.displayName);
        } else {
            console.log('User profile document does not exist');
            updateDisplayName('New User');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        updateDisplayName('New User');
    }
}

// Function to update the display name element
function updateDisplayName(displayName) {
    const displayNameElement = document.querySelector('.display-name');
    displayNameElement.textContent = displayName;
}

// Function to handle user authentication state changes
function handleAuthStateChanged(user) {
    if (user) {
        const userId = user.uid;
        fetchUserProgress(userId);
        fetchUserProfile(userId); // Fetch user profile data
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

    if (progressData && Object.keys(progressData).length > 0) {
        fetch('functions/courseContent.json')
            .then(response => response.json())
            .then(courseContent => {
                courseContent.forEach(module => {
                    const moduleElement = createModuleProgressElement(module, progressData);
                    progressTrackerContainer.appendChild(moduleElement);
    
                    module.subModules.forEach(subModule => {
                        const subModuleElement = createSubModuleProgressElement(subModule, progressData);
                        progressTrackerContainer.appendChild(subModuleElement);
    
                        subModule.lessons.forEach(lesson => {
                            if (progressData[lesson.lessonId] && progressData[lesson.lessonId].completed) {
                                const lessonElement = createLessonProgressElement(lesson, progressData[lesson.lessonId]);
                                progressTrackerContainer.appendChild(lessonElement);
                            }
                        });
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching course content:', error);
                progressTrackerContainer.innerHTML = '<p>Error loading progress data.</p>';
            });
    } else {
        progressTrackerContainer.innerHTML = '<p>No progress data available.</p>';
    }
}

function getCompletedLessonsInModule(moduleData) {
    const completedLessons = [];
    if (moduleData && moduleData.subModules) {
        for (const subModuleData of Object.values(moduleData.subModules)) {
            completedLessons.push(...getCompletedLessonsInSubModule(subModuleData));
        }
    }
    return completedLessons;
}

function getCompletedLessonsInSubModule(subModuleData) {
    if (subModuleData && subModuleData.lessons) {
        return Object.entries(subModuleData.lessons)
            .filter(([, lessonData]) => lessonData && lessonData.completed)
            .map(([lessonTitle]) => lessonTitle);
    }
    return [];
}

function createModuleProgressElement(module, progressData) {
    const completedLessons = module.subModules.reduce((count, subModule) => {
        return count + subModule.lessons.filter(lesson => progressData[lesson.lessonId] && progressData[lesson.lessonId].completed).length;
    }, 0);
    const totalLessons = module.subModules.reduce((count, subModule) => count + subModule.lessons.length, 0);
    const moduleProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const moduleElement = document.createElement('div');
    moduleElement.classList.add('module');
    const moduleTitleElement = document.createElement('h4');
    moduleTitleElement.textContent = module.moduleName;
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

function formatModuleId(moduleId) {
    return moduleId.replace(/([A-Z])/, ' $1').replace(/^./, function(str) {
        return str.toUpperCase();
    });
}

function createSubModuleProgressElement(subModule, progressData) {
    const completedLessons = subModule.lessons.filter(lesson => progressData[lesson.lessonId] && progressData[lesson.lessonId].completed).length;
    const totalLessons = subModule.lessons.length;
    const submoduleProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const submoduleElement = document.createElement('div');
    submoduleElement.classList.add('submodule');
    const submoduleTitleElement = document.createElement('h4');
    submoduleTitleElement.textContent = subModule.subModuleName;
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

function formatSubModuleId(subModuleId) {
    return subModuleId.replace(/_/g, ' ');
}

function createLessonProgressElement(lessonId, lessonData) {
    const currentLesson = lessonId;
    const lessonProgress = lessonData && lessonData.completed ? 100 : 0;

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
    recentAchievementsContainer.innerHTML = '<h3>Achievements</h3>';

    if (achievementsData && achievementsData.length > 0) {
        achievementsData.forEach(achievement => {
            const achievementElement = createAchievementElement(achievement);
            recentAchievementsContainer.appendChild(achievementElement);
        });
    } else {
        recentAchievementsContainer.innerHTML += '<p>No achievements available.</p>';
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

    if (recommendationsData && Object.keys(recommendationsData).length > 0) {
        Object.values(recommendationsData).forEach(recommendation => {
            const recommendationElement = createRecommendationElement(recommendation);
            recommendationsContainer.appendChild(recommendationElement);
        });
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

async function updateLearningGoals(goalsData) {
    const learningGoalsContainer = document.querySelector('.learning-goals .content');
    learningGoalsContainer.innerHTML = '<h3>Your Learning Goals</h3>';

    if (goalsData && goalsData.length > 0) {
        const goalElements = [];
        goalsData.forEach(goal => {
            const goalElement = createLearningGoalElement(goal);
            goalElements.push(goalElement);
            learningGoalsContainer.appendChild(goalElement);
        });

        if (goalElements.length < 3) {
            const addGoalButton = createAddGoalButton();
            learningGoalsContainer.appendChild(addGoalButton);
        }
    } else {
        learningGoalsContainer.innerHTML += '<p>No learning goals available.</p>';
        const addGoalButton = createAddGoalButton();
        learningGoalsContainer.appendChild(addGoalButton);
    }
}

function createLearningGoalElement(goal, goalId) {
    const goalElement = document.createElement('div');
    goalElement.classList.add('learning-goal');

    const titleElement = document.createElement('h3');
    titleElement.textContent = goal.description;

    const progressTextElement = document.createElement('div');
    progressTextElement.classList.add('progress-text');
    progressTextElement.textContent = `${goal.progress} / ${goal.target}`;

    const progressBarElement = document.createElement('div');
    progressBarElement.classList.add('progress-bar');

    const progressElement = document.createElement('div');
    progressElement.classList.add('progress');
    const progressPercentage = Math.min(100, (goal.progress / goal.target) * 100);
    progressElement.style.width = `${progressPercentage}%`;

    progressBarElement.appendChild(progressElement);

    const removeButton = document.createElement('button');
    removeButton.classList.add('button-primary');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeGoal(goalId));

    goalElement.appendChild(titleElement);
    goalElement.appendChild(progressTextElement);
    goalElement.appendChild(progressBarElement);
    goalElement.appendChild(removeButton);

    return goalElement;
}

function createAddGoalButton() {
    const addGoalButton = document.createElement('button');
    addGoalButton.textContent = 'Add Goal';
    addGoalButton.addEventListener('click', showAddGoalForm);
    return addGoalButton;
}

function showAddGoalForm() {
    const addGoalForm = document.createElement('div');
    addGoalForm.classList.add('add-goal-form');

    const goalTypeLabel = document.createElement('label');
    goalTypeLabel.textContent = 'Goal Type:';
    const goalTypeSelect = document.createElement('select');
    goalTypeSelect.innerHTML = `
        <option value="completeLessons">Complete Lessons</option>
        <option value="quizScore">Complete Submodules</option>
        <option value="learnWords">Learn Words</option>
        <option value="quizScore">Get a Quiz Score Higher Than</option>
    `;

    const goalAmountLabel = document.createElement('label');
    goalAmountLabel.textContent = 'Amount:';
    const goalAmountSelect = document.createElement('select');
    goalAmountSelect.innerHTML = `
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="25">25</option>
        <option value="30">30</option>
        <option value="35">35</option>
        <option value="40">40</option>
        <option value="45">45</option>
        <option value="50">50</option>
    `;

    const addButton = document.createElement('button');
    addButton.classList.add('button-secondary');
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
        const goalType = goalTypeSelect.value;
        const goalAmount = parseInt(goalAmountSelect.value);
        addGoal(goalType, goalAmount);
        addGoalForm.remove();
    });

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('button-secondary');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        addGoalForm.remove();
    });

    addGoalForm.appendChild(goalTypeLabel);
    addGoalForm.appendChild(goalTypeSelect);
    addGoalForm.appendChild(goalAmountLabel);
    addGoalForm.appendChild(goalAmountSelect);
    addGoalForm.appendChild(addButton);
    addGoalForm.appendChild(cancelButton);

    const learningGoalsContainer = document.querySelector('.learning-goals .content');
    learningGoalsContainer.appendChild(addGoalForm);
}

async function addGoal(goalType, goalAmount) {
    const userId = auth.currentUser.uid;
    const userGoalsRef = collection(db, 'users', userId, 'goals');
    const userGoalsSnapshot = await getDocs(userGoalsRef);

    if (userGoalsSnapshot.size < 3) {
        const newGoalData = {
            description: goalType,
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            target: goalAmount,
            progress: 0
        };

        await addDoc(userGoalsRef, newGoalData);
        fetchUserProgress(userId);
    } else {
        alert('You have reached the maximum number of goals (3).');
    }
}

async function removeGoal(goalId) {
    const userId = auth.currentUser.uid;
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalRef);
    fetchUserProgress(userId);
}