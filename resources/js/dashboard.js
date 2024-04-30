import {
    auth,
    serverTimestamp,
    onAuthStateChanged,
    fetchUserProfile,
    fetchUserProgress,
    fetchUserAchievements,
    fetchUserRecommendations,
    fetchUserGoals,
    addGoal,
    removeGoal,
    saveFeedback
} from './firebase-config.js';

// Function to update the display name element
function updateDisplayName(displayName) {
    const displayNameElement = document.querySelector('.display-name');
    displayNameElement.textContent = displayName;
}

// Functions to update the dashboard widgets
function updateProgressTracker(progressData) {
    const progressTrackerContainer = document.querySelector('.progress-tracker .content');
    progressTrackerContainer.innerHTML = '<h2>Current Progress</h2>';

    if (progressData && Object.keys(progressData).length > 0) {
        fetch('functions/courseContent.json')
            .then(response => response.json())
            .then(courseContent => {
                courseContent.forEach(module => {
                    const completedLessons = getCompletedLessonsInModule(progressData, module);
                    const totalLessons = getTotalLessonsInModule(module);
                    if (completedLessons.length > 0) {
                        const moduleElement = createModuleProgressElement(module, completedLessons.length, totalLessons);
                        progressTrackerContainer.appendChild(moduleElement);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching course content:', error);
                progressTrackerContainer.innerHTML += '<p>Error loading progress data.</p>';
            });
    } else {
        progressTrackerContainer.innerHTML += '<p>No progress data available.</p>';
    }
}

function getTotalLessonsInModule(module) {
    return module.subModules.reduce((count, subModule) => count + subModule.lessons.length, 0);
}

function createModuleProgressElement(module, completedLessons, totalLessons) {
    const moduleProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const moduleElement = document.createElement('div');
    moduleElement.classList.add('module');
    const moduleTitleElement = document.createElement('h3');
    moduleTitleElement.textContent = module.moduleName;
    const moduleProgressTextElement = document.createElement('span');
    moduleProgressTextElement.classList.add('progress-text');
    moduleProgressTextElement.textContent = `${completedLessons} / ${totalLessons}`;
    const moduleProgressElement = document.createElement('div');
    moduleProgressElement.classList.add('progress-bar');
    const moduleProgressIndicatorElement = document.createElement('div');
    moduleProgressIndicatorElement.classList.add('progress');
    moduleProgressIndicatorElement.style.width = `${moduleProgress}%`;
    moduleProgressElement.appendChild(moduleProgressIndicatorElement);
    moduleElement.appendChild(moduleTitleElement);
    moduleElement.appendChild(moduleProgressTextElement);
    moduleElement.appendChild(moduleProgressElement);

    return moduleElement;
}

function getCompletedLessonsInModule(progressData, module) {
    const completedLessons = [];
    module.subModules.forEach(subModule => {
        completedLessons.push(...getCompletedLessonsInSubModule(progressData, subModule));
    });
    return completedLessons;
}

function getCompletedLessonsInSubModule(progressData, subModule) {
    return subModule.lessons.filter(lesson => progressData[lesson.lessonId] && progressData[lesson.lessonId].completed);
}

function formatLessonId(lessonId) {
    return lessonId.replace(/_/g, '-');
}

function updateRecentAchievements(achievementsData) {
    const recentAchievementsContainer = document.querySelector('.recent-achievements .content');
    recentAchievementsContainer.innerHTML = '<h2>Achievements</h2>';

    if (achievementsData && Object.keys(achievementsData).length > 1) {
        const sortedAchievements = Object.values(achievementsData).sort((a, b) => b.lastUpdated.toMillis() - a.lastUpdated.toMillis());
        const recentAchievements = sortedAchievements.slice(0, 3);

        recentAchievements.forEach(achievement => {
            const achievementElement = createAchievementElement(achievement);
            recentAchievementsContainer.appendChild(achievementElement);
        });
    } else if (achievementsData && Object.keys(achievementsData).length === 1) {
        const achievementElement = createAchievementElement(Object.values(achievementsData)[0]);
        recentAchievementsContainer.appendChild(achievementElement);
    } else {
        recentAchievementsContainer.innerHTML += '<p>No achievements available.</p>';
    }
}

function createAchievementElement(achievement) {
    const achievementElement = document.createElement('div');
    achievementElement.classList.add('achievement');

    const nameElement = document.createElement('h3');
    nameElement.textContent = achievement.title;

    const progressBarElement = document.createElement('div');
    progressBarElement.classList.add('progress-bar');

    const progressElement = document.createElement('div');
    progressElement.classList.add('progress');
    const progressPercentage = Math.min(100, (achievement.progress / achievement.target) * 100);
    progressElement.style.width = `${progressPercentage}%`;

    progressBarElement.appendChild(progressElement);

    achievementElement.appendChild(nameElement);
    achievementElement.appendChild(progressBarElement);

    return achievementElement;
}

function updateRecommendations(recommendationsData) {
    const recommendationsContainer = document.querySelector('.recommendations .content');
    recommendationsContainer.innerHTML = '<h2>Adaptive Learning Recommendations</h2>';

    if (recommendationsData && Object.keys(recommendationsData).length > 0) {
        Object.values(recommendationsData).forEach(recommendation => {
            const recommendationElement = createRecommendationElement(recommendation);
            recommendationsContainer.appendChild(recommendationElement);
        });
    } else {
        recommendationsContainer.innerHTML += '<p>No recommendations available.</p>';
    }
}

function createRecommendationElement(recommendation) {
    const recommendationElement = document.createElement('div');
    recommendationElement.classList.add('recommendation');

    const titleElement = document.createElement('h3');
    titleElement.textContent = formatLessonId(recommendation.lessonId);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = recommendation.reason;

    const linkElement = document.createElement('a');
    linkElement.href = recommendation.pageUrl;
    linkElement.classList.add('recommendation-link');
    linkElement.textContent = 'Learn';

    recommendationElement.appendChild(titleElement);
    recommendationElement.appendChild(descriptionElement);
    recommendationElement.appendChild(linkElement);

    return recommendationElement;
}

function updateLearningGoals(goalsData) {
    const learningGoalsContainer = document.querySelector('.learning-goals .content');
    learningGoalsContainer.innerHTML = '<h2>Learning Goals</h2>';

    if (goalsData && Object.keys(goalsData).length > 0) {
        const goalElements = Object.entries(goalsData).map(([goalId, goal]) => {
            return createLearningGoalElement(goal, goalId);
        });

        goalElements.forEach(goalElement => {
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
    titleElement.textContent = getGoalTitle(goal);

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
    removeButton.addEventListener('click', () => processRemoveGoal(goalId));

    goalElement.appendChild(titleElement);
    goalElement.appendChild(progressTextElement);
    goalElement.appendChild(progressBarElement);
    goalElement.appendChild(removeButton);

    return goalElement;
}

function getGoalTitle(goal) {
    switch (goal.description) {
        case 'completeLessons':
            return `Complete ${goal.target} lessons`;
        case 'quizScore':
            return `Get a quiz score higher than ${goal.target}`;
        case 'learnWords':
            return `Learn ${goal.target} words`;
        case 'completeSubModules':
            return `Complete ${goal.target} submodules`;
        default:
            return goal.description;
    }
}

function createAddGoalButton() {
    const addGoalButton = document.createElement('button');
    addGoalButton.textContent = 'Add Goal';
    addGoalButton.classList.add('button-primary', 'add-goal-button');
    addGoalButton.addEventListener('click', showAddGoalForm);
    return addGoalButton;
}

function showAddGoalForm() {
    const addGoalButton = document.querySelector('.add-goal-button');
    if (addGoalButton) {
        addGoalButton.style.display = 'none';
    }

    const addGoalForm = document.createElement('div');
    addGoalForm.classList.add('add-goal-form');

    const goalTypeLabel = document.createElement('label');
    goalTypeLabel.textContent = 'Goal Type:';
    const goalTypeSelect = document.createElement('select');
    goalTypeSelect.innerHTML = `
        <option value="completeLessons">Complete Lessons</option>
        <option value="completeSubModules">Complete Submodules</option>
        <option value="learnWords">Learn Words</option>
        <option value="quizScore">Get a Quiz Score Higher Than</option>
    `;
    goalTypeSelect.addEventListener('change', updateGoalAmountOptions);

    const goalAmountLabel = document.createElement('label');
    goalAmountLabel.textContent = 'Amount:';
    const goalAmountSelect = document.createElement('select');
    updateGoalAmountOptions();

    function updateGoalAmountOptions() {
        const selectedGoalType = goalTypeSelect.value;
        let options = '';

        if (selectedGoalType === 'quizScore') {
            for (let i = 70; i <= 100; i += 5) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else if (selectedGoalType === 'completeSubModules') {
            for (let i = 1; i <= 20; i++) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else {
            for (let i = 5; i <= 50; i += 5) {
                options += `<option value="${i}">${i}</option>`;
            }
        }

        goalAmountSelect.innerHTML = options;
    }

    const addButton = document.createElement('button');
    addButton.classList.add('button-secondary');
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
        const goalType = goalTypeSelect.value;
        const goalAmount = parseInt(goalAmountSelect.value);
        processAddGoal(goalType, goalAmount);
        addGoalForm.remove();
    });

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('button-secondary');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        addGoalForm.remove();
        if (addGoalButton) {
            addGoalButton.style.display = 'inline-block';
        }
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

async function processAddGoal(goalType, goalAmount) {
    const userId = auth.currentUser.uid;
    try {
        await addGoal(userId, goalType, goalAmount);
        const updatedGoals = await fetchUserGoals(userId, true);
        updateLearningGoals(updatedGoals);

        const addGoalForm = document.querySelector('.add-goal-form');
        if (addGoalForm) {
            addGoalForm.remove();
        }

        const addGoalButton = document.querySelector('.add-goal-button');
        if (addGoalButton && updatedGoals && Object.keys(updatedGoals).length < 3) {
            addGoalButton.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error adding goal:', error);
        if (error.message === 'You have reached the maximum number of goals (3).') {
            alert('You have reached the maximum number of goals (3). Please remove a goal before adding a new one.');
        } else {
            alert('An error occurred while adding the goal. Please try again later.');
        }
    }
}

async function processRemoveGoal(goalId) {
    const userId = auth.currentUser.uid;
    try {
        await removeGoal(userId, goalId);
        const updatedGoals = await fetchUserGoals(userId, true);
        updateLearningGoals(updatedGoals);
    } catch (error) {
        console.error('Error removing goal:', error);
        alert('An error occurred while removing the goal. Please try again later.');
    }
}

async function handleFeedbackSubmit() {
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    let rating = 0;
    for (const input of ratingInputs) {
        if (input.checked) {
            rating = parseInt(input.value);
            break;
        }
    }

    const commentInput = document.getElementById('comment');
    const comment = commentInput.value.trim();

    if (rating === 0 || comment === '') {
        displayFeedbackMessage('Please provide a rating and comment for your feedback.', 'error');
        return;
    }

    if (comment.length > 300) {
        displayFeedbackMessage('Comment cannot exceed 300 characters.', 'error');
        return;
    }

    const userId = auth.currentUser.uid;
    const pageSubmitted = window.location.pathname;

    // Check if the user is eligible to submit feedback
    const isEligible = await checkFeedbackEligibility(userId, pageSubmitted);

    if (!isEligible) {
        displayFeedbackMessage('You can only submit feedback once per page in a 30-minute period.', 'error');
        return;
    }

    const newFeedback = {
        userId: userId,
        rating: rating,
        description: comment,
        feedbackDate: serverTimestamp(),
        pageSubmitted: pageSubmitted
    };

    // Save the feedback to the database
    const feedbackStatus = await saveFeedback(newFeedback);

    if (feedbackStatus === 'success') {
        displayFeedbackMessage('Thank you for your feedback!', 'success');
        // Reset the rating and comment inputs
        for (const input of ratingInputs) {
            input.checked = false;
        }
        commentInput.value = '';
    } else {
        displayFeedbackMessage(feedbackStatus, 'error');
    }
}

async function checkFeedbackEligibility(userId, pageSubmitted) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const feedbackSnapshot = await db.collection('feedback')
        .where('userId', '==', userId)
        .where('pageSubmitted', '==', pageSubmitted)
        .where('feedbackDate', '>', thirtyMinutesAgo)
        .limit(1)
        .get();

    return feedbackSnapshot.empty;
}

function displayFeedbackMessage(message, type) {
    const feedbackMessageElement = document.getElementById('feedbackMessage');
    feedbackMessageElement.textContent = message;
    feedbackMessageElement.className = type;
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            const userId = user.uid;
            fetchUserProgress(userId)
                .then(progressData => {
                    updateProgressTracker(progressData);
                })
                .catch(error => {
                    console.error('Error fetching user progress:', error);
                    updateProgressTracker(null);
                });
    
            fetchUserAchievements(userId)
                .then(achievementsData => {
                    updateRecentAchievements(achievementsData);
                })
                .catch(error => {
                    console.error('Error fetching user achievements:', error);
                    updateRecentAchievements(null);
                });
    
            fetchUserRecommendations(userId)
                .then(recommendationsData => {
                    updateRecommendations(recommendationsData);
                })
                .catch(error => {
                    console.error('Error fetching user recommendations:', error);
                    updateRecommendations(null);
                });
    
            fetchUserGoals(userId)
                .then(goalsData => {
                    updateLearningGoals(goalsData);
                })
                .catch(error => {
                    console.error('Error fetching user goals:', error);
                    updateLearningGoals(null);
                });
    
            fetchUserProfile(userId)
                .then(profileData => {
                    if (profileData.displayName) {
                        updateDisplayName(profileData.displayName);
                    } else {
                        updateDisplayName('New User');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                    updateDisplayName('New User');
                });

            const submitButton = document.getElementById('submitFeedback');
            if (submitButton) {
                submitButton.addEventListener('click', handleFeedbackSubmit);
            }
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