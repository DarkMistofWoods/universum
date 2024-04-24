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

    const svg = d3.select("#progress-visualization")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const moduleCount = progressData.length;
    const angleStep = (Math.PI * 2) / moduleCount;

    const moduleArcs = d3.pie()
        .value(d => d.progress)
        (progressData);

    const moduleGroups = svg.selectAll(".module")
        .data(moduleArcs)
        .enter()
        .append("g")
        .attr("class", "module")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 200)
        .attr("opacity", 1);

    moduleGroups.append("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.8)
        )
        .attr("fill", d => d3.interpolateViridis(d.data.progress));

    moduleGroups.append("text")
        .attr("transform", d => `translate(${d3.arc().centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d.data.moduleName);

    const subModuleGroups = moduleGroups.selectAll(".submodule")
        .data(d => d.data.subModules)
        .enter()
        .append("g")
        .attr("class", "submodule");

    subModuleGroups.append("path")
        .attr("d", (d, i, nodes) => {
            const subModuleCount = nodes.length;
            const subAngleStep = angleStep / subModuleCount;
            return d3.arc()
                .innerRadius(radius * 0.2)
                .outerRadius(radius * 0.4)
                .startAngle(i * subAngleStep)
                .endAngle((i + 1) * subAngleStep)();
        })
        .attr("fill", d => d3.interpolateViridis(d.progress));

    subModuleGroups.append("text")
        .attr("transform", (d, i, nodes) => {
            const subModuleCount = nodes.length;
            const subAngleStep = angleStep / subModuleCount;
            const angle = (i * subAngleStep) + (subAngleStep / 2);
            const x = Math.cos(angle) * (radius * 0.3);
            const y = Math.sin(angle) * (radius * 0.3);
            return `translate(${x}, ${y}) rotate(${angle * 180 / Math.PI - 90})`;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d.subModuleName);

    const lessonGroups = subModuleGroups.selectAll(".lesson")
        .data(d => d.lessons)
        .enter()
        .append("g")
        .attr("class", "lesson");

    lessonGroups.append("circle")
        .attr("cx", (d, i, nodes) => {
            const lessonCount = nodes.length;
            const lessonAngleStep = angleStep / lessonCount;
            const angle = (i * lessonAngleStep) + (lessonAngleStep / 2);
            return Math.cos(angle) * (radius * 0.2);
        })
        .attr("cy", (d, i, nodes) => {
            const lessonCount = nodes.length;
            const lessonAngleStep = angleStep / lessonCount;
            const angle = (i * lessonAngleStep) + (lessonAngleStep / 2);
            return Math.sin(angle) * (radius * 0.2);
        })
        .attr("r", 5)
        .attr("fill", d => d.progress === 1 ? "green" : "red");

    lessonGroups.append("title")
        .text(d => `${d.title} (${d.progress === 1 ? 'Completed' : 'Incomplete'})`);
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