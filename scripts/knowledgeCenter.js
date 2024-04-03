// Simulate fetching user progress (replace this with actual data fetching)
const userProgress = {
    vocabulary: 50,
    grammar: 75,
    comprehension: 25,
    // Add more modules as necessary
};

const userLessonProgress = {
    vocabulary: [
        { lesson: "Lesson 1: Basic Words", progress: 100 },
        { lesson: "Lesson 2: Advanced Words", progress: 75 },
        // Add more lessons and their progress
    ],
    // Include other modules similarly
};

const recommendedModule = 'vocabulary'; // Simulate "Guided Learning" recommendation

document.addEventListener('DOMContentLoaded', function() {
    // Initial setup: update progress bars and recommend module
    setupModules();

    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function() {
            const alreadyExpanded = this.classList.contains('expanded');
            // Collapse any expanded module
            collapseAllModules();
            // Expand the clicked module if it was not already expanded
            if (!alreadyExpanded) {
                this.classList.add('expanded');
                // Show the lessons list for the expanded module
                this.querySelector('.lessonsList').style.display = 'block';
            }
        });
    });
});

function setupModules() {
    document.querySelectorAll('.module').forEach(module => {
        const moduleName = module.getAttribute('data-module');
        const progress = userProgress[moduleName] || 0; // Default to 0 if no progress recorded
        const progressBar = module.querySelector('.progress');
        progressBar.style.width = progress + '%';
        progressBar.querySelector('.progressText').innerText = progress + '% Complete';

        if (moduleName === recommendedModule) {
            module.classList.add('recommended');
        }

        const lessonsList = module.querySelector('.lessonsList');
        if (lessonsList) {
            const lessons = userLessonProgress[moduleName] || [];
            lessonsList.querySelectorAll('li').forEach((li, index) => {
                const lesson = lessons[index];
                if (lesson) {
                    // Assuming you've modified the HTML to include a lessonProgressFill for each lesson
                    const fill = li.querySelector('.lessonProgressFill');
                    fill.style.width = lesson.progress + '%';
                    // Optional: Add progress text or tooltip
                }
            });
        }
    });
}

function collapseAllModules() {
    document.querySelectorAll('.module.expanded').forEach(expandedModule => {
        expandedModule.classList.remove('expanded');
        // Hide the lessons list upon collapse
        const lessonsList = expandedModule.querySelector('.lessonsList');
        if (lessonsList) {
            lessonsList.style.display = 'none';
        }
    });
}

// Optionally, highlight the recommended module for "Guided Learning"
function highlightRecommendedModule() {
    document.querySelector(`.module[data-module="${recommendedModule}"]`).classList.add('highlight');
}