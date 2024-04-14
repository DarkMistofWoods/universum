import { db, auth } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Function to fetch user progress data from Firestore
async function fetchUserProgress(userId) {
    try {
        const userProgressRef = doc(db, 'userProgress', userId);
        const userProgressSnapshot = await getDoc(userProgressRef);

        if (userProgressSnapshot.exists()) {
            return userProgressSnapshot.data().progressData;
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
function createSubModuleElements(subModules, progressData, moduleId) {
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
        const progress = calculateProgress(progressData, moduleId, subModule.subModuleId);
        progressElement.style.width = `${progress}%`;
        
        progressBarElement.appendChild(progressElement);
        
        subModuleElement.appendChild(titleElement);
        subModuleElement.appendChild(progressBarElement);
        
        subModuleElement.addEventListener('click', () => {
            subModuleElement.classList.toggle('expanded');
            const lessonsContainer = subModuleElement.querySelector('.lessons-container');
            if (lessonsContainer) {
                lessonsContainer.remove();
            } else {
                const lessonsContainer = createLessonElements(subModule.lessons, progressData, moduleId, subModule.subModuleId);
                subModuleElement.appendChild(lessonsContainer);
            }
        });
        
        return subModuleElement;
    });
    
    return subModuleElements;
}

// Function to create lesson elements
function createLessonElements(lessons, progressData, moduleId, subModuleId) {
    const lessonsContainer = document.createElement('div');
    lessonsContainer.classList.add('lessons-container');
    
    const lessonElements = lessons.map(lesson => {
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
        
        lessonElement.appendChild(titleElement);
        lessonElement.appendChild(progressBarElement);
        
        return lessonElement;
    });
    
    lessonsContainer.append(...lessonElements);
    
    return lessonsContainer;
}

// Function to handle user authentication state changes
function handleAuthStateChanged(user) {
    if (user) {
        const userId = user.uid;
        fetchUserProgress(userId).then(progressData => {
            fetch('../courseContent.json')
                .then(response => response.json())
                .then(courseContent => {
                    courseContent.forEach(module => {
                        const moduleElement = document.getElementById(`${module.moduleId}`);
                        const progress = calculateProgress(progressData, module.moduleId);
                        moduleElement.querySelector('.progress').style.width = `${progress}%`;
                        
                        moduleElement.addEventListener('click', () => {
                            moduleElement.classList.toggle('expanded');
                            const subModulesContainer = moduleElement.querySelector('.submodules-container');
                            if (subModulesContainer) {
                                subModulesContainer.remove();
                            } else {
                                const subModuleElements = createSubModuleElements(module.subModules, progressData, module.moduleId);
                                const subModulesContainer = document.createElement('div');
                                subModulesContainer.classList.add('submodules-container');
                                subModulesContainer.append(...subModuleElements);
                                moduleElement.appendChild(subModulesContainer);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Error fetching course content:', error);
                });
        });
    } else {
        console.log('User is not authenticated');
        // Handle the case when user is not authenticated
    }
}

// Listen for user authentication state changes
auth.onAuthStateChanged(handleAuthStateChanged);