import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

function createVisualization(courseContent, userProgress) {
    const progressData = calculateProgress(courseContent, userProgress);
    const svgContainer = d3.select('.container-tertiary');
    const width = svgContainer.node().getBoundingClientRect().width;
    const height = svgContainer.node().getBoundingClientRect().height;
    const svg = svgContainer.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define scales and positions for circles and segments
    const angleScale = d3.scaleLinear()
        .domain([0, progressData.length])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(progressData, d => d.subModules.length)])
        .range([50, Math.min(width, height) / 2 - 50]);

    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw circles for modules
    const moduleCircles = svg.selectAll('.module-circle')
        .data(progressData)
        .enter()
        .append('circle')
        .attr('class', 'module-circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', (d, i) => radiusScale(i))
        .attr('fill', 'none')
        .attr('stroke', (d, i) => colors(i))
        .attr('stroke-width', 2);

    // Draw points for submodules
    const subModulePoints = svg.selectAll('.submodule-point')
        .data(progressData.flatMap((d, i) => d.subModules.map(subModule => ({ ...subModule, moduleIndex: i }))))
        .enter()
        .append('circle')
        .attr('class', 'submodule-point')
        .attr('cx', d => width / 2 + radiusScale(d.moduleIndex) * Math.cos(angleScale(d.moduleIndex) + angleScale(1) * d.subModuleIndex / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('cy', d => height / 2 + radiusScale(d.moduleIndex) * Math.sin(angleScale(d.moduleIndex) + angleScale(1) * d.subModuleIndex / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('r', 5)
        .attr('fill', d => colors(d.moduleIndex));

    // Draw lines connecting submodules
    const subModuleLines = svg.selectAll('.submodule-line')
        .data(progressData.flatMap(d => d.subModules.slice(0, -1).map((_, i) => ({ moduleIndex: progressData.indexOf(d), subModuleIndex: i }))))
        .enter()
        .append('line')
        .attr('class', 'submodule-line')
        .attr('x1', d => width / 2 + radiusScale(d.moduleIndex) * Math.cos(angleScale(d.moduleIndex) + angleScale(1) * d.subModuleIndex / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('y1', d => height / 2 + radiusScale(d.moduleIndex) * Math.sin(angleScale(d.moduleIndex) + angleScale(1) * d.subModuleIndex / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('x2', d => width / 2 + radiusScale(d.moduleIndex) * Math.cos(angleScale(d.moduleIndex) + angleScale(1) * (d.subModuleIndex + 1) / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('y2', d => height / 2 + radiusScale(d.moduleIndex) * Math.sin(angleScale(d.moduleIndex) + angleScale(1) * (d.subModuleIndex + 1) / progressData[d.moduleIndex].subModules.length - angleScale(1) / 2))
        .attr('stroke', d => colors(d.moduleIndex))
        .attr('stroke-width', 1);

    // Add interactivity and show lesson details on hover/click
    subModulePoints
        .on('mouseover', function (event, d) {
            d3.select(this).attr('r', 8);
            // Show lesson details in a tooltip or overlay
        })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('r', 5);
            // Hide lesson details
        })
        .on('click', function (event, d) {
            // Show more detailed information about the lesson and its completion status
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