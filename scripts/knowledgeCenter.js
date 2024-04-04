const courseContent = [
    {
        moduleName: "Vocabulary",
        moduleId: "vocabularyModule",
        subModules: [
            {
                subModuleName: "Introduction to Universum Vocabulary",
                subModuleId: "basicVocabulary",
                lessons: [
                    { title: "Lesson 1: Intro to Words", pageUrl: "../knowledge/vocabulary/level1/lesson-1.html" },
                    { title: "Lesson 2: Common Phrases", pageUrl: "../knowledge/vocabulary/level1/lesson-2.html" }
                ]
            },
            {
                subModuleName: "Advanced Vocabulary",
                subModuleId: "advancedVocabulary",
                lessons: [
                    { title: "Lesson 1: Complex Terms", pageUrl: "../knowledge/vocabulary/level2/lesson-1.html" }
                    // Add more lessons
                ]
            }
        ]
    },
    // Add more modules
];

let userLearningMode = "Guided Learning"; // Or "Self-Directed Exploration"

// Placeholder for user's progress in each lesson
const userProgress = {
    vocabulary: {
        basicVocabulary: {
            "Lesson 1: Intro to Words": true, // true indicates completion
            "Lesson 2: Common Phrases": false
        },
        advancedVocabulary: {
            "Lesson 1: Complex Terms": false
        }
    },
    // Include other modules and submodules as necessary
};

// Placeholder for recommended module, submodule, and lessons
const recommendations = {
    module: "Vocabulary",
    subModule: "basicVocabulary",
    lessons: ["Lesson 1: Intro to Words"] // Assuming at least one lesson is recommended
};

document.addEventListener('DOMContentLoaded', function() {
    renderContent(); // Newly structured function to render content and apply initial settings
});

function renderContent() {
    const knowledgeCenter = document.getElementById('knowledgeCenter');
    knowledgeCenter.innerHTML = ''; // Clear existing content (if any)
    courseContent.forEach(module => {
        let moduleHtml = `
            <div class="module" id="${module.moduleId}" data-module="${module.moduleName.toLowerCase()}" ${module.moduleName === recommendations.module ? 'class="recommended"' : ''}>
                <h3>${module.moduleName}</h3>
                <div class="progressBar"><div class="progress"><span class="progress-text">0%</span></div></div>
                ${generateSubModulesHtml(module.subModules)}
            </div>
        `;
        knowledgeCenter.insertAdjacentHTML('beforeend', moduleHtml);
    });

    // Apply learning mode restrictions and update module progress
    applyLearningMode();
    attachEventListeners(); // Attach event listeners after content is generated
    updateModuleProgress();
}

function updateModuleProgress() {
    document.querySelectorAll('.module').forEach(moduleElement => {
        const moduleName = moduleElement.dataset.module;
        let totalProgress = 0;
        let submoduleCount = 0;

        const subModules = Array.from(moduleElement.querySelectorAll('.subModule'));
        subModules.forEach(subModule => {
            const subModuleId = subModule.dataset.subModule;
            const lessons = userProgress[moduleName]?.[subModuleId] || {};
            const completedLessonCount = Object.values(lessons).filter(isCompleted => isCompleted).length;
            const totalLessonCount = courseContent.find(m => m.moduleName.toLowerCase() === moduleName)
                                      .subModules.find(sm => sm.subModuleId === subModuleId)
                                      .lessons.length;

            const subModuleProgress = totalLessonCount > 0 ? (completedLessonCount / totalLessonCount) * 100 : 0;
            subModule.querySelector('.progress').style.width = `${subModuleProgress}%`;

            totalProgress += subModuleProgress;
            submoduleCount++;
        });

        const moduleProgress = submoduleCount > 0 ? totalProgress / submoduleCount : 0;
        moduleElement.querySelector('.progress').style.width = `${moduleProgress}%`;

        // Update the progress bar width and text for the module
        const moduleProgressBar = moduleElement.querySelector('.progress');
        moduleProgressBar.style.width = `${moduleProgress}%`;
        const moduleProgressText = moduleProgressBar.querySelector('.progress-text');
        moduleProgressText.textContent = `${moduleProgress.toFixed(0)}%`;
    });
}

function toggleModule(module) {
    const isExpanded = module.classList.toggle('expanded');
    const subModules = module.querySelectorAll('.subModule');
    subModules.forEach(subModule => {
        subModule.style.display = isExpanded ? 'block' : 'none';
    });
}

function toggleLessonsVisibility(subModule) {
    const isExpanded = subModule.classList.toggle('expanded');
    const lessonsList = subModule.querySelector('.lessonsList');
    lessonsList.style.display = isExpanded ? 'block' : 'none';
}

function attachEventListeners() {
    // Module and submodule toggle functionality
    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function(event) {
            if (!event.target.closest('.subModule, a')) {
                toggleModule(event.currentTarget);
            }
        });
    });

    document.querySelectorAll('.subModule').forEach(subModule => {
        subModule.addEventListener('click', function(event) {
            // Prevents submodule toggle when clicking on links or any interactive element within it
            if (!event.target.closest('a, button, input, [onclick]')) {
                toggleLessonsVisibility(this);
            }
            event.stopPropagation(); // Prevent triggering module toggle
        });
    });

    // Apply click event listener to lesson links
    document.querySelectorAll('.lessonsList a').forEach(link => {
        link.addEventListener('click', (event) => {
            if (link.classList.contains('locked')) {
                event.preventDefault(); // Prevent navigation for locked lessons
                alert("This lesson is currently locked.");
            }
            event.stopPropagation(); // Ensure this doesn't trigger module/submodule toggling
        });
    });
}

function generateSubModulesHtml(subModules) {
    return subModules.map(subModule => `
        <div class="subModule" data-sub-module="${subModule.subModuleId}" ${recommendations.subModule === subModule.subModuleId ? 'class="recommended"' : ''}>
            <div class="subModuleHeader"><h4>${subModule.subModuleName}</h4></div>
            <div class="progressBar"><div class="progress" style="width: 0%;"></div></div>
            <ul class="lessonsList">
                ${subModule.lessons.map(lesson => `
                    <li>
                        <a href="${lesson.pageUrl}" class="lessonLink ${isLessonRecommendedOrCompleted(lesson.title, subModule.subModuleId) ? '' : 'locked'}" data-lesson="${lesson.title}">
                            ${lesson.title}
                        </a>
                    </li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function isLessonRecommendedOrCompleted(lessonTitle, subModuleId) {
    // In Guided Learning mode, a lesson is accessible if it's recommended or already completed
    if (userLearningMode === "Guided Learning") {
        const isCompleted = userProgress[subModuleId] && userProgress[subModuleId][lessonTitle];
        const isRecommended = recommendations.subModule === subModuleId && recommendations.lessons.includes(lessonTitle);
        return isRecommended || isCompleted;
    }
    // In Self-Directed Exploration, all lessons are accessible
    return true;
}

function applyLearningMode() {
    // For "Self-Directed Exploration", no need to lock lessons, so no action is required
    document.querySelectorAll('.lessonsList a').forEach(link => {
        // Adjust based on userLearningMode
        if (userLearningMode === "Guided Learning") {
            lockOrUnlockLessons();
        }
        // The locking logic is integrated within the generation of the lesson links
        // This function could be extended for additional logic specific to learning modes
    });
}

function lockOrUnlockLessons() {
    document.querySelectorAll('.lessonsList a').forEach(link => {
        const lessonName = link.getAttribute('data-lesson');
        const moduleName = link.closest('.module').getAttribute('data-module');
        const subModuleName = link.closest('.subModule').getAttribute('data-sub-module');

        // Determine if the lesson should be accessible
        const isRecommended = recommendations.module.toLowerCase() === moduleName &&
                              recommendations.subModule === subModuleName &&
                              recommendations.lessons.includes(lessonName);
        
        const isCompleted = userProgress[moduleName] && 
                            userProgress[moduleName][subModuleName] && 
                            userProgress[moduleName][subModuleName][lessonName];
        
        if (!isRecommended && !isCompleted) {
            // Mark as locked if not recommended or completed
            link.classList.add('locked');
        } else {
            link.classList.remove('locked');
            // If the lesson is recommended or completed, ensure it's clickable
            link.addEventListener('click', (event) => {
                // Implement navigation to the lesson page
                // This can be a simple href if appropriate or a more complex interaction
            });
        }
    });
}