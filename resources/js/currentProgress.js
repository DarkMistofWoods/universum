import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

function createVisualization(courseContent, userProgress) {
    const progressData = calculateProgress(courseContent, userProgress);
    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#progressVisualization")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const moduleCount = progressData.length;
    const moduleAngle = (2 * Math.PI) / moduleCount;

    progressData.forEach((module, moduleIndex) => {
        const moduleRadius = (moduleIndex + 1) * (radius / (moduleCount + 1));
        const subModuleCount = module.subModules.length;
        const subModuleAngle = moduleAngle / subModuleCount;

        module.subModules.forEach((subModule, subModuleIndex) => {
            const startAngle = moduleIndex * moduleAngle + subModuleIndex * subModuleAngle;
            const endAngle = startAngle + subModuleAngle;

            const subModuleArc = d3.arc()
                .innerRadius(moduleRadius - 20)
                .outerRadius(moduleRadius)
                .startAngle(startAngle)
                .endAngle(endAngle);

            const subModuleGroup = svg.append("g")
                .attr("class", "submodule")
                .on("mouseover", function () {
                    d3.select(this).append("title")
                        .text(`${subModule.subModuleName}\nProgress: ${(subModule.progress * 100).toFixed(2)}%\nQuiz Score: ${(subModule.quizScore * 100).toFixed(2)}%`);
                })
                .on("mouseout", function () {
                    d3.select(this).select("title").remove();
                });

            subModuleGroup.append("path")
                .attr("d", subModuleArc)
                .attr("fill", `hsl(${subModuleIndex * (360 / subModuleCount)}, 50%, ${50 + subModule.progress * 50}%)`);

            subModule.lessons.forEach((lesson, lessonIndex) => {
                const lessonAngle = startAngle + (lessonIndex + 0.5) * (subModuleAngle / (subModule.lessons.length + 1));
                const lessonRadius = moduleRadius;

                const lessonGroup = svg.append("g")
                    .attr("class", "lesson")
                    .on("mouseover", function () {
                        d3.select(this).append("title")
                            .text(`${lesson.title}\nProgress: ${(lesson.progress * 100).toFixed(2)}%\nQuiz Score: ${(lesson.quizScore * 100).toFixed(2)}%`);
                    })
                    .on("mouseout", function () {
                        d3.select(this).select("title").remove();
                    });

                lessonGroup.append("circle")
                    .attr("cx", lessonRadius * Math.cos(lessonAngle))
                    .attr("cy", lessonRadius * Math.sin(lessonAngle))
                    .attr("r", 5)
                    .attr("fill", lesson.progress === 1 ? "green" : "red");
            });
        });
    });
}

function calculateProgress(courseContent, userProgress) {
    const progressData = courseContent.map((module) => ({
        ...module,
        progress: 0,
        quizScore: 0,
        subModules: module.subModules.map((subModule) => ({
            ...subModule,
            progress: 0,
            quizScore: 0,
            lessons: subModule.lessons.map((lesson) => {
                const lessonProgress = userProgress[lesson.lessonId]?.completed ? 1 : 0;
                const lessonQuizScores = userProgress[lesson.lessonId]?.quizScores || [];
                const lessonQuizScore = lessonQuizScores.length > 0 ? lessonQuizScores.reduce((sum, score) => sum + score, 0) / lessonQuizScores.length : 0;

                return {
                    ...lesson,
                    progress: lessonProgress,
                    quizScore: lessonQuizScore,
                };
            }),
        })),
    }));

    progressData.forEach((module) => {
        let moduleProgress = 0;
        let moduleQuizScore = 0;

        module.subModules.forEach((subModule) => {
            let subModuleProgress = 0;
            let subModuleQuizScore = 0;

            subModule.lessons.forEach((lesson) => {
                subModuleProgress += lesson.progress;
                subModuleQuizScore += lesson.quizScore;
            });

            subModuleProgress /= subModule.lessons.length;
            subModuleQuizScore /= subModule.lessons.length;

            subModule.progress = subModuleProgress;
            subModule.quizScore = subModuleQuizScore;

            moduleProgress += subModuleProgress;
            moduleQuizScore += subModuleQuizScore;
        });

        moduleProgress /= module.subModules.length;
        moduleQuizScore /= module.subModules.length;

        module.progress = moduleProgress;
        module.quizScore = moduleQuizScore;
    });

    return progressData;
    /* the progressData object will look like this:

    [
        {
            moduleName: 'Module 1',
            moduleId: 'moduleId1',
            progress: 0.75,
            quizScore: 0.85,
            subModules: [
                {
                    subModuleName: 'Submodule 1',
                    subModuleId: 'subModuleId1',
                    progress: 0.8,
                    quizScore: 0.9,
                    lessons: [
                        {
                            title: 'Lesson 1',
                            lessonId: 'lessonId1',
                            progress: 1,
                            quizScore: 0.95,
                        },
                        // ...
                    ],
                },
                // ...
            ],
        },
        // ...
    ]

    */
}

async function loadCourseContent() {
    const response = await fetch('functions/courseContent.json');
    return await response.json();
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            initializeVisualization(user);
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