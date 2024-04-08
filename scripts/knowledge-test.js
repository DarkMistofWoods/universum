
const courseContent = []; // assume that this contains data

// Placeholder for recommended module, submodule, and lessons
const recommendations = {
    module: "Vocabulary",
    subModule: "Vocabulary_1",
    lessons: ["Lesson 1: Common Phrases"]
    // Assuming at least one lesson is recommended
};

let userProgress = {}; // assume that this contains data

function generateSubModulesHtml(subModules, isParentModuleRecommended, moduleName) {
    return subModules.map(subModule => {
        const isRecommendedSubModule = isParentModuleRecommended && subModule.subModuleId === recommendations.subModule;
        return `
            <div class="subModule ${isRecommendedSubModule ? 'recommended' : ''}" data-sub-module="${subModule.subModuleId}">
                <div class="subModuleHeader"><h4>${subModule.subModuleName}</h4></div>
                <div class="progressBar"><div class="progress"></div></div>
                <ul class="lessonsList">
                    ${subModule.lessons.map(lesson => {
                        const lessonData = userProgress[moduleName.toLowerCase()]?.[subModule.subModuleId]?.[lesson.title] || {};
                        const averageScoreText = calculateAverageQuizScore(lessonData.quizScores || []);
                        const userProgressForSubModule = userProgress[subModule.subModuleId] || {};
                        
                        const lessonUnlocked = shouldUnlockLesson(lesson, subModule.lessons, userProgressForSubModule, recommendations);
                        const lockedClass = lessonUnlocked ? '' : 'locked';
                        return `<li>
                            <a href="${lesson.pageUrl}" class="lessonLink ${lockedClass}" data-lesson="${lesson.title}">
                                ${lesson.title} <span class="quizScore">${averageScoreText}</span>
                            </a>
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function isLessonRecommendedOrCompleted(lessonTitle, subModuleId, moduleName) {
    // In Guided Learning mode, a lesson is accessible if it's recommended or already completed
    if (userLearningMode === "guided") {
        const moduleData = userProgress[moduleName.toLowerCase()];
        const subModuleData = moduleData && moduleData[subModuleId];
        const lessonData = subModuleData && subModuleData[lessonTitle];
        const isCompleted = lessonData && lessonData.completed;
        const isRecommended = recommendations.module === moduleName &&
                              recommendations.subModule === subModuleId &&
                              recommendations.lessons.includes(lessonTitle);
        
        return isRecommended || isCompleted;
    }
    // In Self-Directed Exploration, all lessons are accessible
    return true;
}

function lockOrUnlockLessons() {
    let unlockNext = false;

    Object.keys(courseContent).forEach((moduleKey, moduleIndex, moduleArray) => {
        const module = courseContent[moduleKey];

        Object.keys(module.subModules).forEach((subModuleKey, subModuleIndex, subModuleArray) => {
            const subModule = module.subModules[subModuleKey];

            subModule.lessons.forEach((lesson, lessonIndex, lessonArray) => {
                const lessonData = userProgress[moduleKey]?.[subModuleKey]?.[lesson.title];
                const isCompleted = lessonData?.completed;
                const isRecommended = recommendations.lessons.includes(lesson.title); // Assuming recommendations is an array of lesson titles

                if (unlockNext) {
                    console.log("Unlocking lesson: " + lesson.title)
                    unlockLesson(lesson);
                    unlockNext = false; // Reset after unlocking unless it's recommended
                }

                if (isRecommended) {
                    unlockLesson(lesson);
                    // Do not set unlockNext true for recommended lessons to prevent unlocking the next lesson automatically
                } else if (isCompleted) {
                    console.log("Found completed lesson: " + lesson.title)
                    unlockNext = true; // Set to unlock the next lesson only if current lesson is completed and not just recommended
                }

                // Handling the last lesson in the submodule
                if (isCompleted && lessonIndex === lessonArray.length - 1) {
                    handleLastLessonUnlocking(moduleIndex, subModuleIndex, moduleArray, subModuleArray, module, subModule);
                    unlockNext = false; // Ensure we don't unlock an additional lesson after moving to the next module/submodule
                }
            });
        });
    });
}

function handleLastLessonUnlocking(moduleIndex, subModuleIndex, moduleArray, subModuleArray, module, subModule) {
    if (subModuleIndex < subModuleArray.length - 1) {
        // Unlock the first lesson of the next submodule if not the last submodule
        const nextSubModuleKey = subModuleArray[subModuleIndex + 1];
        const nextSubModule = module.subModules[nextSubModuleKey];
        unlockLesson(nextSubModule.lessons[0]);
    } else if (moduleIndex < moduleArray.length - 1) {
        // Unlock the first lesson of the next module's first submodule if not the last module
        const nextModuleKey = moduleArray[moduleIndex + 1];
        const nextModule = courseContent[nextModuleKey];
        const nextSubModuleKeys = Object.keys(nextModule.subModules);
        if (nextSubModuleKeys.length > 0) {
            const nextSubModule = nextModule.subModules[nextSubModuleKeys[0]];
            unlockLesson(nextSubModule.lessons[0]);
        }
    }
}

function unlockLesson(lesson) {
    // Implement the logic to remove 'locked' class based on lesson's identifier
    const lessonSelector = `.lessonLink[data-lesson="${lesson.title}"]`;
    const lessonElement = document.querySelector(lessonSelector);
    if (lessonElement) {
        lessonElement.classList.remove('locked');
    }
}