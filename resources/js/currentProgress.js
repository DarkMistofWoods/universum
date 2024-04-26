import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

function createVisualization(courseContent, userProgress) {
    const progressData = calculateProgress(courseContent, userProgress);
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.9;
    const radius = Math.min(width, height) / 2;

    // Predefined color variables
    const submoduleArcColor = "#A67A46";
    const completedLessonColor = "#A67A46";
    const incompleteLessonColor = "#3B3C40";

    d3.select("#progressVisualization").remove();

    const svg = d3.select(".container-tertiary")
        .append("svg")
        .attr("id", "progressVisualization")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const filteredProgressData = progressData.filter(module =>
        module.subModules.some(subModule =>
            subModule.lessons.some(lesson => lesson.progress === 1)
        )
    );

    let activeTooltip = null;

    function showTooltip(event, data, type) {
        const tooltip = d3.select("#tooltip");
        let content = '';
    
        if (type === 'lesson') {
            content = `
                <div>${data.title}</div>
                ${data.progress === 0 ? '<div style="font-weight: bold;">Incomplete</div>' : `
                    <div>Progress: ${(data.progress * 100).toFixed(2)}%</div>
                    <div>Quiz Score: ${(data.quizScore).toFixed(2)}%</div>
                `}
            `;
        } else if (type === 'submodule') {
            content = `
                <div>${data.subModuleName}</div>
                <div>Progress: ${(data.progress * 100).toFixed(2)}%</div>
                <div>Overall Score: ${(data.quizScore).toFixed(2)}%</div>
            `;
        }
    
        tooltip.html(content)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("display", "block")
            .style("text-align", "left");
        activeTooltip = tooltip;
    }

    function hideTooltip() {
        if (activeTooltip) {
            activeTooltip.style("display", "none");
            activeTooltip = null;
        }
    }

    svg.on("click", hideTooltip);

    // Update the visualization based on the zoom level
    function updateVisualization(zoomLevel) { 
        const duration = 1000; // Animation duration in milliseconds
    
        const filteredModules = filteredProgressData.slice(0, filteredProgressData.length - zoomLevel);
 
        const moduleCount = filteredModules.length;
        const moduleAngle = (2 * Math.PI) / moduleCount;

        const moduleRadiusScale = d3.scaleLinear()
            .domain([0, moduleCount - 1])
            .range([radius * 0.3, radius * 0.7]);
    
        // Shrink the existing elements towards the center
        svg.selectAll(".submodule-node, .lesson-node")
            .transition()
            .duration(duration)
            .attr("transform", "scale(0.01)")
            .style("opacity", 0)
            .remove();
    
        // Expand the center circle
        svg.select("circle")
            .transition()
            .duration(duration)
            .attr("r", 15);

        setTimeout(() => {
            svg.selectAll("*").remove(); // Clear the visualization
    
            filteredModules.forEach((module, moduleIndex) => {
                const moduleRadius = moduleRadiusScale(moduleIndex);
                const filteredSubModules = module.subModules.filter(subModule =>
                    subModule.lessons.some(lesson => lesson.progress === 1)
                );
                const subModuleCount = filteredSubModules.length;
                const subModuleAngle = moduleAngle / subModuleCount;
    
                filteredSubModules.forEach((subModule, subModuleIndex) => {
                    const startAngle = moduleIndex * moduleAngle + subModuleIndex * subModuleAngle;
                    const endAngle = startAngle + subModuleAngle;
    
                    const subModuleArc = d3.arc()
                        .innerRadius(moduleRadius - 20)
                        .outerRadius(moduleRadius)
                        .cornerRadius(15)
                        .startAngle(startAngle)
                        .endAngle(endAngle);
    
                    const subModuleGroup = svg.append("g")
                        .attr("class", "submodule-node");
    
                    const subModuleOpacity = subModule.lessons.every(lesson => lesson.progress === 1) ? 1 : 0.3;
    
                    subModuleGroup.append("path")
                        .attr("d", subModuleArc)
                        .attr("fill", submoduleArcColor)
                        .attr("fill-opacity", subModuleOpacity);
    
                    const subModuleHitArea = subModuleGroup.append("path")
                        .attr("d", subModuleArc)
                        .attr("fill", "transparent")
                        .attr("stroke", "transparent")
                        .attr("stroke-width", 20)
                        .on("mouseover", function (event) {
                            const subModuleOuterRadius = moduleRadius + 5;
                            const subModuleInnerRadius = moduleRadius - 10;
                            const subModuleArcHover = d3.arc()
                                .innerRadius(subModuleInnerRadius)
                                .outerRadius(subModuleOuterRadius)
                                .cornerRadius(15)
                                .startAngle(startAngle)
                                .endAngle(endAngle);
    
                            d3.select(this.parentNode).select("path:not([stroke])") // Select the non-hit-area path
                                .attr("d", subModuleArcHover);
    
                            showTooltip(event, subModule, 'submodule');
                        })
                        .on("mouseout", function () {
                            d3.select(this.parentNode).select("path:not([stroke])") // Select the non-hit-area path
                                .attr("d", subModuleArc);
    
                            hideTooltip();
                        })
                        .on("click", function (event) {
                            event.stopPropagation();
                            if (activeTooltip) {
                                activeTooltip.style("display", "none");
                            }
                            showTooltip(event, subModule, 'submodule');
                        });
    
                    subModule.lessons.forEach((lesson, lessonIndex) => {
                        const lessonAngle = startAngle + (lessonIndex + 0.5) * (subModuleAngle / subModule.lessons.length) - Math.PI / 2;
                        const lessonRadius = moduleRadius + 15;
    
                        const lessonGroup = svg.append("g")
                            .attr("class", "lesson-node");
    
                        lessonGroup.append("line")
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("x2", (lessonRadius + 10) * Math.cos(lessonAngle))
                            .attr("y2", (lessonRadius + 10) * Math.sin(lessonAngle))
                            .attr("stroke", lesson.progress === 1 ? completedLessonColor : incompleteLessonColor)
                            .attr("stroke-opacity", lesson.progress === 1 ? lesson.quizScore : 1)
                            .attr("stroke-width", 2);
    
                        lessonGroup.append("circle")
                            .attr("cx", lessonRadius * Math.cos(lessonAngle))
                            .attr("cy", lessonRadius * Math.sin(lessonAngle))
                            .attr("r", 10)
                            .attr("fill", lesson.progress === 1 ? completedLessonColor : incompleteLessonColor);
    
                            const lessonHitArea = lessonGroup.append("circle")
                            .attr("cx", lessonRadius * Math.cos(lessonAngle))
                            .attr("cy", lessonRadius * Math.sin(lessonAngle))
                            .attr("r", 20)
                            .attr("fill", "transparent")
                            .on("mouseover", function (event) {
                                const lessonHoverRadius = lessonRadius + 10;
                                d3.select(this.parentNode).select("circle:not([fill='transparent'])") // Select the non-hit-area circle
                                    .attr("cx", lessonHoverRadius * Math.cos(lessonAngle))
                                    .attr("cy", lessonHoverRadius * Math.sin(lessonAngle));
                                showTooltip(event, lesson, 'lesson');
                            })
                            .on("mouseout", function () {
                                d3.select(this.parentNode).select("circle:not([fill='transparent'])") // Select the non-hit-area circle
                                    .attr("cx", lessonRadius * Math.cos(lessonAngle))
                                    .attr("cy", lessonRadius * Math.sin(lessonAngle));
    
                                hideTooltip();
                            })
                            .on("click", function (event) {
                                event.stopPropagation();
                                if (activeTooltip) {
                                    activeTooltip.style("display", "none");
                                }
                                showTooltip(event, lesson, 'lesson');
                            });
                    });
                });
            });
    
            // Show the first lesson of the first submodule of the first module if no progress
            if (filteredProgressData.length === 0) {
                const firstModule = progressData[0];
                const firstSubModule = firstModule.subModules[0];
                const firstLesson = firstSubModule.lessons[0];
        
                const lessonGroup = svg.append("g")
                    .attr("class", "lesson-node")
                    .on("mouseover", function (event) {
                        showTooltip(event, firstLesson, 'lesson');
                    })
                    .on("mouseout", function () {
                        hideTooltip();
                    });
        
                lessonGroup.append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", -radius * 0.2)
                    .attr("stroke", incompleteLessonColor)
                    .attr("stroke-width", 1);
        
                lessonGroup.append("circle")
                    .attr("cx", 0)
                    .attr("cy", -radius * 0.2)
                    .attr("r", 8)
                    .attr("fill", incompleteLessonColor);
            }

            svg.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 5)
                .attr("fill", completedLessonColor);

            // Expand the new elements outward
            svg.selectAll(".submodule-node, .lesson-node")
                .style("opacity", 0)
                .attr("transform", "scale(0.1)")
                .transition()
                .duration(duration)
                .attr("transform", "scale(1)")
                .style("opacity", 1);
    
            // Shrink the center circle
            svg.select("circle")
                .transition()
                .duration(duration)
                .attr("r", 5);
        }, duration);
    }

    // Create the zoom slider
    const zoomSlider = d3.select("#zoomSlider")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", filteredProgressData.length - 1)
        .attr("step", 1)
        .attr("value", 0)
        .on("input", function () {
            const zoomLevel = +this.value;
            updateVisualization(zoomLevel);
        });

    // Initial visualization
    updateVisualization(0);
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
            let completedLessonsCount = 0;

            subModule.lessons.forEach((lesson) => {
                subModuleProgress += lesson.progress;
                if (lesson.progress === 1) {
                    subModuleQuizScore += lesson.quizScore;
                    completedLessonsCount++;
                }
            });

            subModuleProgress /= subModule.lessons.length;
            subModuleQuizScore = completedLessonsCount > 0 ? subModuleQuizScore / completedLessonsCount : 0;

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