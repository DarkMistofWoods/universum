import { db, auth, collection, getDocs, fetchUserSettings, fetchUserProgress } from './firebase-config.js';

// Function to calculate progress based on user progress data
function calculateProgress(progressData, lessonId) {
    if (!progressData || !progressData[lessonId]) {
        return 0;
    }

    return progressData[lessonId].completed ? 100 : 0;
}

// Function to create submodule elements
function createSubModuleElements(subModules, progressData, moduleId, recommendationsData, isFirstModule) {
    const subModuleElements = subModules.map((subModule, subModuleIndex) => {
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
        const completedLessons = subModule.lessons.filter(lesson => progressData && progressData[lesson.lessonId] && progressData[lesson.lessonId].completed).length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        progressElement.style.width = `${progress}%`;
        
        progressBarElement.appendChild(progressElement);
        
        const quizPercentageElement = document.createElement('div');
        quizPercentageElement.classList.add('quiz-percentage');
        const completedLessonsForQuiz = subModule.lessons.filter(lesson => progressData && progressData[lesson.lessonId] && progressData[lesson.lessonId].completed);
        const quizScores = completedLessonsForQuiz.map(lesson => progressData[lesson.lessonId].quizScores || []).flat();
        const averageQuizScore = calculateAverageQuizScore(quizScores);
        quizPercentageElement.textContent = averageQuizScore !== 'Incomplete' ? `Avg: ${averageQuizScore}` : 'Incomplete';
        
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
                const lessonsContainer = createLessonElements(subModule.lessons, progressData, recommendationsData, isFirstModule, subModuleIndex === 0);
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
function createLessonElements(lessons, progressData, recommendationsData, isFirstModule, isFirstSubModule) {
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
        const progress = calculateProgress(progressData, lesson.lessonId);
        progressElement.style.width = `${progress}%`;
        
        progressBarElement.appendChild(progressElement);
        
        const quizPercentageElement = document.createElement('div');
        quizPercentageElement.classList.add('quiz-percentage');
        const lessonData = progressData?.[lesson.lessonId] || {};
        const latestQuizScore = lessonData.quizScores?.slice(-1)?.[0] || null;
        const averageQuizScore = calculateAverageQuizScore(lessonData.quizScores || []);
        quizPercentageElement.textContent = `Latest Quiz: ${latestQuizScore !== null ? `${latestQuizScore}%` : 'Incomplete'} | Average Score: ${averageQuizScore !== 'Incomplete' ? averageQuizScore : 'Incomplete'}`;
        
        const isCompleted = lessonData.completed || false;
        const isRecommended = recommendationsData?.some(recommendation => recommendation.lessonId === lesson.lessonId) || false;
        const isFirstLesson = isFirstModule && isFirstSubModule && index === 0;
        const isPreviousLessonCompleted = index > 0 && (progressData?.[lessons[index - 1].lessonId]?.completed || false);
        
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
                const recommendationsData = userSettings?.learningPath === 'guided' ? userSettings.recommendationsData || [] : [];
                
                fetch('functions/courseContent.json')
                    .then(response => response.json())
                    .then(courseContent => {
                        courseContent.forEach((module, moduleIndex) => {
                            const moduleElement = document.getElementById(`${module.moduleId}`);
                            if (moduleElement) {
                                const totalLessons = module.subModules.reduce((count, subModule) => count + subModule.lessons.length, 0);
                                const completedLessons = module.subModules.flatMap(subModule => subModule.lessons)
                                    .filter(lesson => progressData && progressData[lesson.lessonId] && progressData[lesson.lessonId].completed)
                                    .length;
                                const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                                moduleElement.querySelector('.progress').style.width = `${progress}%`;
                                
                                const quizPercentageElement = moduleElement.querySelector('.quiz-percentage');
                                const completedLessonsWithScores = module.subModules.flatMap(subModule => subModule.lessons)
                                    .filter(lesson => progressData && progressData[lesson.lessonId] && progressData[lesson.lessonId].completed && progressData[lesson.lessonId].quizScores && progressData[lesson.lessonId].quizScores.length > 0);
                                const quizScores = completedLessonsWithScores.flatMap(lesson => progressData[lesson.lessonId].quizScores);
                                const averageQuizScore = calculateAverageQuizScore(quizScores);
                                quizPercentageElement.textContent = averageQuizScore !== 'Incomplete' ? `Average Score: ${averageQuizScore}` : 'Incomplete';
                                
                                moduleElement.addEventListener('click', () => {
                                    moduleElement.classList.toggle('expanded');
                                    const subModulesContainer = moduleElement.querySelector('.submodules-container');
                                    if (subModulesContainer) {
                                        subModulesContainer.remove();
                                    } else {
                                        const subModuleElements = createSubModuleElements(module.subModules, progressData, module.moduleId, recommendationsData, moduleIndex === 0);
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