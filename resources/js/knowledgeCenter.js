import { db, auth, fetchUserSettings } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Function to fetch user progress data from Firestore
async function fetchUserProgress(userId) {
    try {
        const userProgressRef = doc(db, 'userProgress', userId);
        const userProgressSnapshot = await getDoc(userProgressRef);

        if (userProgressSnapshot.exists()) {
            const progressData = userProgressSnapshot.data().progressData;
            return progressData;
        } else {
            console.log('User progress document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return null;
    }
}

// Function to calculate progress based on user progress data
function calculateProgress(progressData, moduleId, subModuleId = null, lessonTitle = null) {
    if (!progressData || !progressData[moduleId]) {
        return 0;
    }

    if (subModuleId && lessonTitle) {
        return progressData[moduleId].subModules[subModuleId].lessons[lessonTitle].completed ? 100 : 0;
    } else if (subModuleId) {
        const subModuleData = progressData[moduleId].subModules[subModuleId];
        const totalLessons = Object.keys(subModuleData.lessons).length;
        const completedLessons = Object.values(subModuleData.lessons).filter(lesson => lesson.completed).length;
        return (completedLessons / totalLessons) * 100;
    } else {
        const totalSubModules = Object.keys(progressData[moduleId].subModules).length;
        const completedSubModules = Object.values(progressData[moduleId].subModules).filter(subModule => subModule.subModuleProgress === 100).length;
        return (completedSubModules / totalSubModules) * 100;
    }
}

// Function to create submodule elements
function createSubModuleElements(subModules, progressData, moduleId, recommendationsData) {
    const subModuleElements = subModules.map(subModule => {
        const subModuleElement = document.createElement('div');
        subModuleElement.classList.add('knowledge-card', 'submodule');
        subModuleElement.setAttribute('data-module-id', moduleId);
        subModuleElement.setAttribute('data-submodule-id', subModule.subModuleId);
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = subModule.subModuleName;
        
        const progressBarElement = document.createElement('div');
        progressBarElement.classList.add('progress-bar');
        
        const progressElement = document.createElement('div');
        progressElement.classList.add('progress');
        
        const totalLessons = subModule.lessons.length;
        const completedLessons = Object.values(progressData?.[moduleId]?.subModules?.[subModule.subModuleId]?.lessons || {}).filter(lesson => lesson.completed).length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        progressElement.style.width = `${progress}%`;
        
        progressBarElement.appendChild(progressElement);
        
        const quizPercentageElement = document.createElement('div');
        quizPercentageElement.classList.add('quiz-percentage');
        const completedLessonsForQuiz = Object.values(progressData?.[moduleId]?.subModules?.[subModule.subModuleId]?.lessons || {}).filter(lesson => lesson.completed);
        const quizScores = completedLessonsForQuiz.map(lesson => lesson.recentQuizScores || []).flat();
        const averageQuizScore = calculateAverageQuizScore(quizScores);
        quizPercentageElement.textContent = averageQuizScore !== 'Incomplete' ? `Average Score: ${averageQuizScore}` : 'Incomplete';
        
        subModuleElement.appendChild(titleElement);
        subModuleElement.appendChild(progressBarElement);
        subModuleElement.appendChild(quizPercentageElement);
    
        subModuleElement.addEventListener('click', (event) => {
            event.stopPropagation();
            subModuleElement.classList.toggle('expanded');
            const lessonsContainer = subModuleElement.querySelector('.lessons-container');
            if (lessonsContainer) {
                lessonsContainer.remove();
            } else {
                const lessonsContainer = createLessonElements(subModule.lessons, progressData, moduleId, subModule.subModuleId, recommendationsData);
                subModuleElement.appendChild(lessonsContainer);
            }
        });
        
        return subModuleElement;
    });
    
    return subModuleElements;
}

// Function to calculate average quiz score
function calculateAverageQuizScore(quizScores) {
    if (quizScores.length === 0) {
        return 'Incomplete';
    }
    const sum = quizScores.reduce((acc, score) => acc + score, 0);
    const average = sum / quizScores.length;
    return `${average.toFixed(2)}%`;
}

// Function to create lesson elements
function createLessonElements(lessons, progressData, moduleId, subModuleId, recommendationsData) {
    const lessonsContainer = document.createElement('div');
    lessonsContainer.classList.add('lessons-container');
    
    const lessonElements = lessons.map((lesson, index) => {
        const lessonElement = document.createElement('div');
        lessonElement.classList.add('knowledge-card', 'lesson');
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = lesson.title;
        
        const progressBarElement = document.createElement('div');
        progressBarElement.classList.add('progress-bar');
        
        const progressElement = document.createElement('div');
        progressElement.classList.add('progress');
        const progress = calculateProgress(progressData, moduleId, subModuleId, lesson.title);
        progressElement.style.width = `${progress}%`;
        
        progressBarElement.appendChild(progressElement);
        
        const quizPercentageElement = document.createElement('div');
        quizPercentageElement.classList.add('quiz-percentage');
        const lessonData = progressData?.[moduleId]?.subModules?.[subModuleId]?.lessons?.[lesson.title] || {};
        const latestQuizScore = lessonData.recentQuizScores?.slice(-1)?.[0] || null;
        const averageQuizScore = calculateAverageQuizScore(lessonData.recentQuizScores || []);
        quizPercentageElement.textContent = `Latest Quiz: ${latestQuizScore !== null ? `${latestQuizScore}%` : 'Incomplete'} | Average Quiz: ${averageQuizScore !== 'Incomplete' ? averageQuizScore : 'Incomplete'}`;
        
        const isCompleted = lessonData.completed || false;
        const isRecommended = recommendationsData?.some(recommendation => recommendation.lessonTitle === lesson.title) || false;
        const isFirstLesson = index === 0;
        const isPreviousLessonCompleted = index > 0 && (progressData?.[moduleId]?.subModules?.[subModuleId]?.lessons?.[lessons[index - 1].title]?.completed || false);
        
        if (isCompleted || isRecommended || isFirstLesson || isPreviousLessonCompleted) {
            lessonElement.classList.add('unlocked');
            lessonElement.addEventListener('click', () => {
                window.location.href = lesson.pageUrl;
            });
        } else {
            lessonElement.classList.add('locked');
            const lockIcon = document.createElement('span');
            lockIcon.classList.add('lock-icon');
            lockIcon.textContent = '🔒';
            titleElement.appendChild(lockIcon);
        }
        
        lessonElement.appendChild(titleElement);
        lessonElement.appendChild(progressBarElement);
        lessonElement.appendChild(quizPercentageElement);
        
        return lessonElement;
    });
    
    lessonsContainer.append(...lessonElements);
    
    return lessonsContainer;
}

// Function to handle user authentication state changes
function handleAuthStateChanged(user) {
    if (user) {
        const userId = user.uid;
        Promise.all([fetchUserProgress(userId), fetchUserSettings(userId)])
            .then(([progressData, userSettings]) => {
                const recommendationsData = userSettings?.guidedLearningPath ? progressData?.recommendationsData || [] : [];
                
                fetch('resources/courseContent.json')
                    .then(response => response.json())
                    .then(courseContent => {
                        courseContent.forEach(module => {
                            const moduleElement = document.getElementById(`${module.moduleId}`);
                            if (moduleElement) {
                                const totalLessons = module.subModules.reduce((count, subModule) => count + subModule.lessons.length, 0);
                                const completedLessons = Object.values(progressData?.[module.moduleId]?.subModules || {})
                                    .flatMap(subModule => Object.values(subModule.lessons))
                                    .filter(lesson => lesson.completed)
                                    .length;
                                const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                                moduleElement.querySelector('.progress').style.width = `${progress}%`;
                                
                                const quizPercentageElement = moduleElement.querySelector('.quiz-percentage');
                                const completedLessonsWithScores = Object.values(progressData?.[module.moduleId]?.subModules || {})
                                    .flatMap(subModule => Object.values(subModule.lessons))
                                    .filter(lesson => lesson.completed && lesson.recentQuizScores && lesson.recentQuizScores.length > 0);
                                const quizScores = completedLessonsWithScores.flatMap(lesson => lesson.recentQuizScores);
                                const averageQuizScore = calculateAverageQuizScore(quizScores);
                                quizPercentageElement.textContent = averageQuizScore !== 'Incomplete' ? `Average Score: ${averageQuizScore}` : 'Incomplete';
                                
                                moduleElement.addEventListener('click', () => {
                                    moduleElement.classList.toggle('expanded');
                                    const subModulesContainer = moduleElement.querySelector('.submodules-container');
                                    if (subModulesContainer) {
                                        subModulesContainer.remove();
                                    } else {
                                        const subModuleElements = createSubModuleElements(module.subModules, progressData, module.moduleId, recommendationsData);
                                        const subModulesContainer = document.createElement('div');
                                        subModulesContainer.classList.add('submodules-container');
                                        subModulesContainer.append(...subModuleElements);
                                        moduleElement.appendChild(subModulesContainer);
                                    }
                                });
                            } else {
                                console.warn(`Module element not found for module ID: ${module.moduleId}`);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching course content:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    } else {
        console.log('User is not authenticated');
        // Handle the case when user is not authenticated
    }
}

// Listen for user authentication state changes
auth.onAuthStateChanged(handleAuthStateChanged);