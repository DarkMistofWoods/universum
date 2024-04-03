// Simulate fetching user progress (replace this with actual data fetching)
const userLessonProgress = {
    vocabulary: {
        basicVocabulary: 75,
        advancedVocabulary: 25,
        // Other submodules...
    },
    grammar: {
        basicGrammar: 60,
        advancedGrammar: 40,
        // Other submodules...
    },
    comprehension: {
        basicComprehension: 80,
        advancedComprehension: 0,
    },
    // Other modules...
};

// Simulate "Guided Learning" recommendations
const recommendedModule = 'vocabulary';
const recommendedSubModule = {
    vocabulary: 'basicVocabulary', // Example
    // Other modules...
};

document.addEventListener('DOMContentLoaded', function() {
    setupModules();

    ['vocabulary', 'grammar', 'comprehension'].forEach(moduleName => {
        updateModuleProgress(moduleName);
    });

    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function(event) {
            // Ensure clicks on submodules do not trigger the module expansion/collapse
            if (!event.target.closest('.subModule')) {
                toggleModule(event.currentTarget);
            }
        });
    });

    // Adjusting subModule clicks to stop propagation to the module container
    document.querySelectorAll('.subModule .subModuleHeader').forEach(header => {
        header.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent triggering the module's click event
            const subModule = this.parentNode;
            toggleLessonsVisibility(subModule);
        });
    });
});

function updateModuleProgress(moduleName) {
    const module = document.querySelector(`.module[data-module="${moduleName}"]`);
    const subModules = module.querySelectorAll('.subModule');
    let totalProgress = 0;
    subModules.forEach(subModule => {
        const subModuleName = subModule.getAttribute('data-sub-module');
        const progress = userLessonProgress[moduleName][subModuleName] || 0;
        totalProgress += progress;
    });
    const averageProgress = totalProgress / subModules.length;
    const mainProgressBar = module.querySelector('.progress');
    mainProgressBar.style.width = `${averageProgress}%`;
    module.querySelector('.progressText').innerText = `${Math.round(averageProgress)}% Complete`;
}

function setupModules() {
    document.querySelectorAll('.module').forEach(module => {
        // Setup module based on userProgress...
        const moduleName = module.getAttribute('data-module');

        // Highlight the recommended module
        if (moduleName === recommendedModule) {
            module.classList.add('recommended');
        }

        // Setup sub-modules based on userLessonProgress...
        module.querySelectorAll('.subModule').forEach(subModule => {
            const subModuleName = subModule.getAttribute('data-sub-module');
            const progress = userLessonProgress[moduleName][subModuleName] || 0;
            subModule.querySelector('.progress').style.width = progress + '%';
            // Initially hide lessons list
            subModule.querySelector('.lessonsList').style.display = 'none';
             // Highlight the recommended sub-module
            if (recommendedSubModule[moduleName] === subModuleName) {
                subModule.classList.add('recommended');
            }

             // Find the .progress element within this submodule and set its width
            const progressBar = subModule.querySelector('.progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`; // Dynamically set the width based on progress
            }
        });
    });
}

function toggleModule(module) {
     // Determine the current expanded state based on a class or display style
     const isExpanded = module.classList.toggle('expanded');
     // Toggle the display of subModules based on the expanded state
     const subModules = module.querySelectorAll('.subModule');
     subModules.forEach(subModule => {
         subModule.style.display = isExpanded ? 'block' : 'none';
     });
}

function toggleLessonsVisibility(subModule) {
    const isExpanded = !subModule.classList.contains('expanded');
    subModule.classList.toggle('expanded', isExpanded);
    const lessonsList = subModule.querySelector('.lessonsList');
    lessonsList.style.display = isExpanded ? 'block' : 'none';
}

// Optionally, highlight the recommended module for "Guided Learning"
function highlightRecommendedModule() {
    document.querySelector(`.module[data-module="${recommendedModule}"]`).classList.add('highlight');
}