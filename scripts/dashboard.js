import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, continue with page-specific logic
        await initializeDashboard(user);
    } else {
        // User is not signed in, redirect to login
        window.location.href = 'login.html';
    }
});

let displayStatus = {} 

function preprocessDataForDisplayStatus(userProgress, recommendations) {
    const detailedStats = {
        lessonsCompletedDetails: {},
        quizScoresDetails: {}
    };

    Object.keys(userProgress).forEach(moduleKey => {
        detailedStats.lessonsCompletedDetails[moduleKey] = {};
        detailedStats.quizScoresDetails[moduleKey] = {};

        let allSubmodulesCompleted = true;
        let anySubmoduleOrLessonCompleted = false;

    
        Object.keys(userProgress[moduleKey]).forEach(submoduleKey => {
            let lessonsCompleted = 0;
            let quizScores = [];

            let allLessonsCompleted = true;
            let anyLessonCompleted = false;
    
            Object.keys(userProgress[moduleKey][submoduleKey]).forEach(lessonKey => {
                const lesson = userProgress[moduleKey][submoduleKey][lessonKey]; // Correctly access the lesson object
                const completed = lesson.completed;
                if (completed) {
                    lessonsCompleted++;

                    anyLessonCompleted = true;
                    anySubmoduleOrLessonCompleted = true;
                    displayStatus[lessonKey] = 'completed'; // Mark the lesson as completed
                } else {
                    allLessonsCompleted = false;
                    allSubmodulesCompleted = false;
                }
                
                if (lesson.quizScores) {
                    quizScores = quizScores.concat(lesson.quizScores || []);
                }
            });

            detailedStats.lessonsCompletedDetails[moduleKey][submoduleKey] = lessonsCompleted;
            detailedStats.quizScoresDetails[moduleKey][submoduleKey] = quizScores.length > 0 ? (quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length).toFixed(2) : "N/A";
    
            if (allLessonsCompleted) {
                displayStatus[submoduleKey] = 'completed'; // All lessons in this submodule are completed
            } else if (anyLessonCompleted) {
                displayStatus[submoduleKey] = 'connected'; // At least one lesson is completed
                displayStatus = { ...displayStatus, ...markConnectedLessonsIncomplete(userProgress[moduleKey][submoduleKey]) };
            } else {
                displayStatus[submoduleKey] = 'notDisplayed'; // No lessons are completed
            }
        });
    
        if (allSubmodulesCompleted) {
            displayStatus[moduleKey] = 'completed'; // All submodules are completed
        } else if (anySubmoduleOrLessonCompleted) {
            displayStatus[moduleKey] = 'connected'; // At least one submodule or lesson is completed
        } else {
            displayStatus[moduleKey] = 'notDisplayed'; // No submodules or lessons are completed
        }
    });

    if (recommendations) {
        // Ensure the module and submodule are marked as recommended
        displayStatus[recommendations.module] = 'recommended';
        displayStatus[recommendations.subModule] = 'recommended';

        // Mark recommended lessons explicitly
        recommendations.lessons.forEach(lesson => {
            displayStatus[lesson] = 'recommended'; // Always mark recommended lessons
        });
    }

    return detailedStats;
}

async function initializeDashboard(user) {
    try {
        const userProfilesRef = doc(db, 'userProfiles', user.uid);
        const profilesDoc = await getDoc(userProfilesRef);
        
        if (profilesDoc.exists()) {
            const profileData = profilesDoc.data();
            document.getElementById('userName').textContent = profileData.displayName || "User";
            // Populate additional UI elements with user profile data as necessary
        } else {
            console.log("No user profile found.");
        }

        // Further dashboard initialization that depends on user being present,
        // like fetching userProgress, can continue here...

        const userProgressRef = doc(db, 'userProgress', user.uid);
        const progressDoc = await getDoc(userProgressRef); 
        // Assuming userProgress is fetched and available
        let detailedStats = {};
        
        if (progressDoc.exists()) {
            const progressData = progressDoc.data();
            // call functions to update the progress visualizer here
            detailedStats = preprocessDataForDisplayStatus(progressData, recommendations);
            renderCustomNetworkVisualization(progressData);
            updateStats(progressData);
        } else {
            console.log("No user progress found. Using demo data.");
            
            detailedStats = preprocessDataForDisplayStatus(dummyProgress, recommendations);
            renderCustomNetworkVisualization(dummyProgress); // Use demo data
            updateStats(dummyProgress);
        }

        initializeStatsInteraction(detailedStats);
    } catch (error) {
        console.error("Error initializing dashboard: ", error);
    }
}

// Helper function to mark lessons as 'connected' if their parent submodule is 'connected' but not all lessons are completed
function markConnectedLessonsIncomplete(submodule) {
    return Object.keys(submodule).reduce((acc, lessonKey) => {
        if (!submodule[lessonKey]) acc[lessonKey] = 'connected'; // Incomplete lesson in a partially completed submodule
        return acc;
    }, {});
}

function renderCustomNetworkVisualization(userProgress) {
    const svg = document.querySelector('#networkVisualization svg');
    svg.setAttribute('viewBox', '0 0 800 600'); // Adjust as needed for full view in the container
    svg.innerHTML = ''; // Clear existing visualization

    const moduleRadius = 30; // Largest
    const submoduleRadius = 20; // Medium
    const lessonRadius = 10; // Smallest
    const center = { x: 400, y: 300 }; // Central point for the layout
    let moduleAngle = 36; // shift the module connections CCW
    const moduleDistance = 200; // Distance from center to module
    const submoduleDistance = 100; // Distance from module to submodule
    const lessonDistance = 35; // Distance from submodule to lesson

    const moduleKeys = Object.keys(userProgress);
    const moduleAngleIncrement = (2 * Math.PI) / moduleKeys.length;
    const modulePositions = []; // Store module positions for interconnecting them later

    moduleKeys.forEach((moduleKey, moduleIndex) => {
        const moduleStatus = displayStatus[moduleKey];
        if (moduleStatus !== 'notDisplayed') {

            const modulePosition = {
                x: center.x + moduleDistance * Math.cos(moduleAngle),
                y: center.y + moduleDistance * Math.sin(moduleAngle)
            };
            modulePositions.push(modulePosition); // Store position for later use
            renderNode(svg, modulePosition.x, modulePosition.y, moduleKey, moduleRadius, displayStatus[moduleKey], '#5F736F', 'module', moduleKey);

            const submoduleKeys = Object.keys(userProgress[moduleKey]);
            const submoduleAngleIncrement = (2 * Math.PI) / submoduleKeys.length;
            let submoduleAngle = 12; // shift the submodule connections CCW

            submoduleKeys.forEach((submoduleKey, submoduleIndex) => {
                const submoduleStatus = displayStatus[submoduleKey];
                if (submoduleStatus !== 'notDisplayed') {
                    const submodulePosition = {
                        x: modulePosition.x + submoduleDistance * Math.cos(submoduleAngle),
                        y: modulePosition.y + submoduleDistance * Math.sin(submoduleAngle)
                    };
                    
                    renderNode(svg, submodulePosition.x, submodulePosition.y, submoduleKey, submoduleRadius, displayStatus[submoduleKey], '#80A69F', 'submodule', moduleKey, submoduleKey);
                    renderLine(svg, modulePosition.x, modulePosition.y, submodulePosition.x, submodulePosition.y);

                    const lessonKeys = Object.keys(userProgress[moduleKey][submoduleKey]);
                    const lessonAngleIncrement = (2 * Math.PI) / lessonKeys.length;
                    let lessonAngle = 36; // shift the lesson connections CCW

                    lessonKeys.forEach((lessonKey, lessonIndex) => {
                        const lessonStatus = displayStatus[lessonKey];
                        if (lessonStatus === 'completed' || lessonStatus === 'connected' || lessonStatus === 'recommended') {
                            const lessonPosition = {
                                x: submodulePosition.x + lessonDistance * Math.cos(lessonAngle),
                                y: submodulePosition.y + lessonDistance * Math.sin(lessonAngle)
                            };
                            renderNode(svg, lessonPosition.x, lessonPosition.y, lessonKey, lessonRadius, displayStatus[lessonKey], '#95BFB8', 'lesson', moduleKey, submoduleKey);
                            renderLine(svg, submodulePosition.x, submodulePosition.y, lessonPosition.x, lessonPosition.y);

                            lessonAngle += lessonAngleIncrement;
                        }
                    });

                    submoduleAngle += submoduleAngleIncrement;
                }
            });

            moduleAngle += moduleAngleIncrement;
        }
    });
    
    // Interconnect all module nodes
    modulePositions.forEach((pos1, index1) => {
        modulePositions.forEach((pos2, index2) => {
            if (index2 > index1) {
                renderLine(svg, pos1.x, pos1.y, pos2.x, pos2.y);
            }
        });
    });

    const bounds = calculateBounds(modulePositions);
    svg.setAttribute('viewBox', `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`);
    adjustViewBox(svg)
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderNode(svg, x, y, label, radius, status, color, type, moduleName, subModuleName) {
    // Determine the fill color based on the status
    let fillColor = color;
    let prefix = ""; // text indicator for if the current node is finished

    switch (status) { // filter node based on it's completion or connection status
        case 'completed':
            break;
        case 'recommended':
            prefix = "Recommended: "
            fillColor = '#BDD9DB';
            break;
        case 'connected':
            prefix = "Incomplete: "
            fillColor = '#505959'; // A color indicating connection but not completion, e.g., grey
            break;
        default:
            // If the status is not 'completed' or 'connected', do not render the node
            return;
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor);
    svg.appendChild(circle);
    circle.setAttribute('data-name', label); // Store the node's name for later reference
    circle.classList.add('interactive-node'); // Add a class for styling and selecting

    // Event listeners for hover and click
    circle.addEventListener('mouseenter', function() {
        this.setAttribute('r', parseFloat(radius) + 2); // Make the node larger
        // Optionally, show the name above the node here
        const nodeName = this.getAttribute('data-name');
        const formattedName = formatNodeName(nodeName)
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y - radius - 10); // Position the text above the node
        text.setAttribute('text-anchor', 'middle'); // Center the text above the node
        text.setAttribute('fill', '#262223'); // Text color
        text.setAttribute('class', 'node-label'); // CSS class for styling
        text.textContent = prefix.concat(formattedName);
        svg.appendChild(text); // Add text to the SVG

        const textSize = text.getBBox();

        // Create background rect based on text size
        const padding = 4; // Adjust padding around text
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', textSize.x - padding);
        rect.setAttribute('y', textSize.y - padding);
        rect.setAttribute('rx', 5);
        rect.setAttribute('ry', 5);
        rect.setAttribute('width', textSize.width + 2 * padding);
        rect.setAttribute('height', textSize.height + 2 * padding);
        rect.setAttribute('fill', '#80A69F'); // Background color
        rect.setAttribute('class', 'text-background');

        // Insert rect before text
        svg.insertBefore(rect, text);
    });
    circle.addEventListener('mouseleave', function() {
        this.setAttribute('r', radius); // Revert to original size
        // Optionally, hide the name here
        svg.querySelectorAll('.node-label, .text-background').forEach(el => el.remove()); // Remove all text labels
    });
    circle.addEventListener('click', function() {
        const textLabels = svg.querySelectorAll('.node-label');
        textLabels.forEach(label => label.remove()); // Remove all text labels

        let url;
        switch(type) {
            case 'lesson':
                const lessonNumber = label.match(/\d+/)[0]; // Assumes lesson labels contain numbers
                url = `../knowledge/${moduleName.toLowerCase()}/level${subModuleName.match(/\d+/)[0]}/lesson-${lessonNumber}.html`;
                break;
            case 'submodule':
                url = `../knowledge.html?module=${capitalizeFirstLetter(moduleName)}&submodule=${capitalizeFirstLetter(subModuleName)}`;
                break;
            case 'module':
                url = `../knowledge.html?module=${capitalizeFirstLetter(moduleName)}`;
                break;
            default:
                console.error('Unknown node type', type);
                return;
        }

        // Implement the pulse animation (optional)
        setTimeout(() => {
            window.location.href = url; // Redirect after the animation
        }, 400); // Adjust time to match the pulse animation duration
    });
}

function formatNodeName(nodeName) {
    // Step 1: Remove text before and including a colon if present
    let formattedName = nodeName.includes(':') ? nodeName.split(':').pop().trim() : nodeName;

    // Step 2: Replace underscores with spaces
    formattedName = formattedName.replace(/_/g, ' ');

    // Step 3: Capitalize the first letter
    formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

    return formattedName;
}

function renderLine(svg, x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#BDD9DB');
    line.setAttribute('stroke-width', '1');
    svg.insertBefore(line, svg.firstChild); // Ensure lines are under nodes
}

// calculates the max width and height based on current active content
function calculateBounds(modulePositions) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    if (modulePositions.length === 0) {
        return { minX: 0, maxX: 800, minY: 0, maxY: 600 }; // Default viewBox if no positions
    }

    modulePositions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
    });

    const padding = 100; // Increased padding to prevent overlap
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    // Ensure the bounds are finite numbers
    minX = isFinite(minX) ? minX : 0;
    maxX = isFinite(maxX) ? maxX : 800;
    minY = isFinite(minY) ? minY : 0;
    maxY = isFinite(maxY) ? maxY : 600;

    return { minX, maxX, minY, maxY };
}

function adjustViewBox(svg) {
    const bbox = svg.getBBox();
    const padding = 100; // Adjust padding as needed
    svg.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + 2 * padding} ${bbox.height + 2 * padding}`);
}

function updateStats(userProgress) {
    let totalLessonsCompleted = 0;
    let totalModulesCompleted = 0;
    let totalQuizScores = [];
    let totalQuizzes = 0;

    Object.values(userProgress).forEach(module => {
        Object.values(module).forEach(subModule => {
            Object.values(subModule).forEach(lesson => {
                if (lesson.completed) totalLessonsCompleted++;
                totalQuizScores = totalQuizScores.concat(lesson.quizScores);
            });
        });

        if (Object.values(module).every(subModule => Object.values(subModule).every(lesson => lesson.completed))) {
            totalModulesCompleted++;
        }
    });

    const averageQuizScore = totalQuizScores.length > 0 ? totalQuizScores.reduce((acc, score) => acc + score, 0) / totalQuizScores.length : 0;

    document.getElementById('stat1').textContent = `Total Lessons Completed: ${totalLessonsCompleted}`;
    document.getElementById('stat2').textContent = `Modules Completed: ${totalModulesCompleted}`;
    document.getElementById('stat3').textContent = `Average Quiz Score: ${averageQuizScore.toFixed(2)}%`;
}

function buildDetailedLessonsContent(details) {
    let content = '';
    let hasCompletedAnyLessons = false;

    Object.keys(details).forEach(moduleKey => {
        let moduleContent = '';
        Object.entries(details[moduleKey]).forEach(([submoduleKey, lessonsCompleted]) => {
            if (lessonsCompleted > 0) {
                moduleContent += `<li>${formatNodeName(submoduleKey)}: ${lessonsCompleted} lessons completed</li>`;
                hasCompletedAnyLessons = true;
            }
        });
        if (moduleContent) {
            content += `<li>${capitalizeFirstLetter(moduleKey)}<ul>${moduleContent}</ul></li>`;
        }
    });

    return hasCompletedAnyLessons ? `<ul>${content}</ul>` : '<ul>No lessons completed</ul>';
}

function buildDetailedQuizScoresContent(details) {
    let content = '';
    let hasQuizScores = false;

    Object.keys(details).forEach(moduleKey => {
        let moduleContent = '';
        Object.entries(details[moduleKey]).forEach(([submoduleKey, averageScore]) => {
            if (averageScore !== "N/A") {
                moduleContent += `<li>${formatNodeName(submoduleKey)}: Average Quiz Score ${averageScore}</li>`;
                hasQuizScores = true;
            }
        });
        if (moduleContent) {
            content += `<li>${capitalizeFirstLetter(moduleKey)}<ul>${moduleContent}</ul></li>`;
        }
    });

    return hasQuizScores ? `<ul>${content}</ul>` : '<ul>No quizzes completed</ul>';
}

function buildCompletedModulesContent(modulesCompletedDetails) {
    // Assuming modulesCompletedDetails is an object with module names as keys and a boolean indicating completion as values
    const completedModules = Object.entries(modulesCompletedDetails)
        .filter(([moduleName, completed]) => completed)
        .map(([moduleName]) => moduleName);

    if (completedModules.length === 0) {
        return '<ul>No modules completed</ul>';
    }

    // Generate HTML list of completed modules
    const content = completedModules
        .map(moduleName => `<li>${moduleName}</li>`)
        .join('');

    return `<ul>${content}</ul>`;
}

function handleStatComparisonClick(statDiv, detailedStats) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    // Check if there's already a canvas to avoid creating multiple
    let canvas = statDiv.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'radarChart';
        chartContainer.appendChild(canvas);
        statDiv.appendChild(chartContainer);

        // Assuming userProgress and globalDummyProgress are accessible
        displayRadarChart(userProgress, globalDummyProgress);
    }
}

function closeOtherStats(currentStat) {
    document.querySelectorAll('.stat.expanded').forEach(expandedStat => {
        if (expandedStat !== currentStat) {
            expandedStat.classList.remove('expanded');
            expandedStat.querySelector('.stat-details')?.remove();
        }
    });
}

function updateOrAppendDetailsDiv(statDiv, detailedContent) {
    const detailsDiv = statDiv.querySelector('.stat-details') || document.createElement('div');
    detailsDiv.className = 'stat-details';
    detailsDiv.innerHTML = detailedContent;
    if (!statDiv.querySelector('.stat-details')) {
        statDiv.appendChild(detailsDiv);
    } else {
        statDiv.querySelector('.stat-details').innerHTML = detailedContent;
    }
}

function displayRadarChart(userProgress, globalDummyProgress) {
    const userAverageScores = {};
    const globalAverageScores = {};

    // Calculate user's average scores by module
    Object.keys(userProgress).forEach(moduleKey => {
        const quizScores = [];
        Object.values(userProgress[moduleKey]).forEach(submodule => {
            Object.values(submodule).forEach(lesson => {
                if (lesson.quizScores && lesson.quizScores.length) {
                    quizScores.push(...lesson.quizScores);
                }
            });
        });
        const averageScore = quizScores.length ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length : 0;
        userAverageScores[moduleKey] = averageScore;
    });

    // Calculate global average scores by module
    Object.keys(globalDummyProgress).forEach(moduleKey => {
        const quizScores = [];
        Object.values(globalDummyProgress[moduleKey]).forEach(submodule => {
            Object.values(submodule).forEach(lesson => {
                if (lesson.quizScores && lesson.quizScores.length) {
                    quizScores.push(...lesson.quizScores);
                }
            });
        });
        const averageScore = quizScores.length ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length : 0;
        globalAverageScores[moduleKey] = averageScore;
    });

    // Setup and display the radar chart
    const ctx = document.getElementById('radarChart').getContext('2d'); // Ensure you have a canvas element with id="radarChart"
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(userAverageScores),
            datasets: [{
                label: 'Your Average Scores',
                data: Object.values(userAverageScores),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'Global Average Scores',
                data: Object.values(globalAverageScores),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: false
                    },
                    suggestedMin: 50,
                    suggestedMax: 100
                }
            }
        }
    });
}

function initializeStatsInteraction(detailedStats) {
    document.querySelectorAll('.stat').forEach(stat => {
        stat.addEventListener('click', function() {
            // Close any other expanded stats
            closeOtherStats(this);

            this.classList.toggle('expanded');
            let detailedContent = '';

            if (!this.classList.contains('expanded')) {
                this.querySelector('.stat-details')?.remove();
                return;
            }

            // Determine which type of details to build based on the clicked stat
            switch (this.id) {
                case 'stat1':
                    detailedContent = buildDetailedLessonsContent(detailedStats.lessonsCompletedDetails);
                    break;
                case 'stat2':
                    detailedContent = buildCompletedModulesContent(detailedStats.modulesCompletedDetails || {});
                    break;
                case 'stat3':
                    detailedContent = buildDetailedQuizScoresContent(detailedStats.quizScoresDetails);
                    break;
                case 'statComparison':
                    detailedContent = handleStatComparisonClick(this, detailedStats);
                    return;
            }

            updateOrAppendDetailsDiv(this, detailedContent);
        });
    });
}

// Placeholder for user's progress in each lesson
const dummyProgress = {
    vocabulary: {
        Vocabulary_1: {
            "Lesson 1: Common Phrases": {
                completed: false, // completion is determined by having an average quiz score of 60% or above (server) should not revert to false if it's already true
                quizScores: [] // Five most recent scores
            },
            "Lesson 2: Numbers and Counting": {
                completed: false,
                quizScores: [] // Scores have not been added because user has not completed any quizzes 
            },
            "Lesson 3: Colors and Shapes": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Time and Days": {
                completed: false,
                quizScores: [] 
            },
        },
        Vocabulary_2: {
            "Lesson 1: Family and People": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Food and Drink": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Clothing and Body": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Home and Daily Routines": {
                completed: false,
                quizScores: [] 
            },
        },
        Vocabulary_3: {
            "Lesson 1: Nature and Weather": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: City and Transportation": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Shopping and Money": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Health and Emergency": {
                completed: false,
                quizScores: [] 
            },
        },
        Vocabulary_4: {
            "Lesson 1: Emotions and Opinions": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Hobbies and Leisure": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Education and Work": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Travel and Culture": {
                completed: false,
                quizScores: [] 
            },
        },
        Vocabulary_5: {
            "Lesson 1: Complex Descriptions": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Abstract Concepts": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Formal and Informal Language": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Compound Word Construction": {
                completed: false,
                quizScores: [] 
            },
        },
        Vocabulary_6: {
            "Lesson 1: Science and Technology": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Arts and Literature": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Business and Economy": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Politics and Society": {
                completed: false,
                quizScores: [] 
            },
        }
    },
    grammar: {
        Grammar_1: {
            "Lesson 1: Sentence Structure": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Pronouns and Simple Verbs": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Present, Past, and Future Tenses": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Yes/No Questions and Answers": {
                completed: false,
                quizScores: [] 
            },
        },
        Grammar_2: {
            "Lesson 1: Negation": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Plurals and Quantity": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Descriptive Language": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Prepositions and Directions": {
                completed: false,
                quizScores: [] 
            },
        },
        Grammar_3: {
            "Lesson 1: Possessive Structures": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Comparatives and Superlatives": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Imperatives and Commands": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Question Words": {
                completed: false,
                quizScores: [] 
            },
        },
        Grammar_4: {
            "Lesson 1: Conjunctions and Complex Sentences": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Conditional Sentences": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Expressing Opinions and Emotions": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Indirect Speech and Reported Questions": {
                completed: false,
                quizScores: [] 
            },
        },
        Grammar_5: {
            "Lesson 1: Nuances of Politeness": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Cultural Expressions and Idioms": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Error Correction and Clarification": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Style and Register": {
                completed: false,
                quizScores: [] 
            },
        },
        Grammar_6: {
            "Lesson 1: Debating and Persuasion": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Storytelling and Narration": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Academic and Formal Writing": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Humor and Playfulness in Language": {
                completed: false,
                quizScores: [] 
            },
        }
    },
    comprehension: {
        Comprehension_1: {
            "Lesson 1: Understanding Basic Greetings and Introductions": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Numbers and Time": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Common Phrases and Responses": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Simple Instructions and Commands": {
                completed: false,
                quizScores: [] 
            },
        },
        Comprehension_2: {
            "Lesson 1: Shopping Conversations": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Restaurant and Food": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Directions and Transportation": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Weather and Seasons": {
                completed: false,
                quizScores: [] 
            },
        },
        Comprehension_3: {
            "Lesson 1: Educational Content": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Work and Occupation Dialogues": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Health and Wellness": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Entertainment and Media": {
                completed: false,
                quizScores: [] 
            },
        },
        Comprehension_4: {
            "Lesson 1: Narratives and Storytelling": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Opinions and Arguments": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Cultural and Historical Texts": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Technical and Scientific Articles": {
                completed: false,
                quizScores: [] 
            },
        },
        Comprehension_5: {
            "Lesson 1: Abstract and Philosophical Texts": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Poetry and Literature": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: News and Current Events": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Formal and Academic Papers": {
                completed: false,
                quizScores: [] 
            },
        },
        Comprehension_6: {
            "Lesson 1: Interactive Scenarios and Role Plays": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Listening and Audio Comprehension": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Visual Comprehension and Interpretation": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Comprehension Through Creation": {
                completed: false,
                quizScores: [] 
            },
        }
    },
    math: {
        Math_1: {
            "Lesson 1: Introduction to Base-12 System": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Counting in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Basic Operations in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Multiplication and Division in Base-12": {
                completed: false,
                quizScores: [] 
            },
        },
        Math_2: {
            "Lesson 1: Carrying and Borrowing in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Advanced Multiplication and Division": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Fractions in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Converting Between Base-10 and Base-12": {
                completed: false,
                quizScores: [] 
            },
        },
        Math_3: {
            "Lesson 1: Base-12 Place Values": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Using Base-12 in Practical Situations": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Decimals in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Ratios and Proportions in Base-12": {
                completed: false,
                quizScores: [] 
            },
        },
        Math_4: {
            "Lesson 1: Geometric Shapes and Measurements in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Algebraic Expressions in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Graphing in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Statistics and Probability in Base-12": {
                completed: false,
                quizScores: [] 
            },
        },
        Math_5: {
            "Lesson 1: Mathematical Puzzles in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 2: Exploring Patterns and Sequences in Base-12": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 3: Base-12 in Science and Technology": {
                completed: false,
                quizScores: [] 
            },
            "Lesson 4: Theoretical Math in Base-12": {
                completed: false,
                quizScores: [] 
            },
        }
    },
    // Include other modules and submodules as necessary
};

// Placeholder for global users' progress in each lesson
const globalDummyProgress = {
    vocabulary: {
        Vocabulary_1: {
            "Lesson 1: Common Phrases": {
                completed: false, // completion is ignored for global data
                quizScores: [78]
            },
            "Lesson 2: Numbers and Counting": {
                completed: false,
                quizScores: [89] 
            },
            "Lesson 3: Colors and Shapes": {
                completed: false,
                quizScores: [32] 
            },
            "Lesson 4: Time and Days": {
                completed: false,
                quizScores: [65] 
            },
        },
        Vocabulary_2: {
            "Lesson 1: Family and People": {
                completed: false,
                quizScores: [78] 
            },
            "Lesson 2: Food and Drink": {
                completed: false,
                quizScores: [57] 
            },
            "Lesson 3: Clothing and Body": {
                completed: false,
                quizScores: [67] 
            },
            "Lesson 4: Home and Daily Routines": {
                completed: false,
                quizScores: [86] 
            },
        },
        Vocabulary_3: {
            "Lesson 1: Nature and Weather": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 2: City and Transportation": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 3: Shopping and Money": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 4: Health and Emergency": {
                completed: false,
                quizScores: [82] 
            },
        },
        Vocabulary_4: {
            "Lesson 1: Emotions and Opinions": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 2: Hobbies and Leisure": {
                completed: false,
                quizScores: [73] 
            },
            "Lesson 3: Education and Work": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 4: Travel and Culture": {
                completed: false,
                quizScores: [92] 
            },
        },
        Vocabulary_5: {
            "Lesson 1: Complex Descriptions": {
                completed: false,
                quizScores: [83] 
            },
            "Lesson 2: Abstract Concepts": {
                completed: false,
                quizScores: [92] 
            },
            "Lesson 3: Formal and Informal Language": {
                completed: false,
                quizScores: [91] 
            },
            "Lesson 4: Compound Word Construction": {
                completed: false,
                quizScores: [73] 
            },
        },
        Vocabulary_6: {
            "Lesson 1: Science and Technology": {
                completed: false,
                quizScores: [95] 
            },
            "Lesson 2: Arts and Literature": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 3: Business and Economy": {
                completed: false,
                quizScores: [92] 
            },
            "Lesson 4: Politics and Society": {
                completed: false,
                quizScores: [82] 
            },
        }
    },
    grammar: {
        Grammar_1: {
            "Lesson 1: Sentence Structure": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 2: Pronouns and Simple Verbs": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 3: Present, Past, and Future Tenses": {
                completed: false,
                quizScores: [83] 
            },
            "Lesson 4: Yes/No Questions and Answers": {
                completed: false,
                quizScores: [95] 
            },
        },
        Grammar_2: {
            "Lesson 1: Negation": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 2: Plurals and Quantity": {
                completed: false,
                quizScores: [85] 
            },
            "Lesson 3: Descriptive Language": {
                completed: false,
                quizScores: [74] 
            },
            "Lesson 4: Prepositions and Directions": {
                completed: false,
                quizScores: [83] 
            },
        },
        Grammar_3: {
            "Lesson 1: Possessive Structures": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 2: Comparatives and Superlatives": {
                completed: false,
                quizScores: [85] 
            },
            "Lesson 3: Imperatives and Commands": {
                completed: false,
                quizScores: [74] 
            },
            "Lesson 4: Question Words": {
                completed: false,
                quizScores: [76] 
            },
        },
        Grammar_4: {
            "Lesson 1: Conjunctions and Complex Sentences": {
                completed: false,
                quizScores: [95] 
            },
            "Lesson 2: Conditional Sentences": {
                completed: false,
                quizScores: [87] 
            },
            "Lesson 3: Expressing Opinions and Emotions": {
                completed: false,
                quizScores: [73] 
            },
            "Lesson 4: Indirect Speech and Reported Questions": {
                completed: false,
                quizScores: [91] 
            },
        },
        Grammar_5: {
            "Lesson 1: Nuances of Politeness": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 2: Cultural Expressions and Idioms": {
                completed: false,
                quizScores: [78] 
            },
            "Lesson 3: Error Correction and Clarification": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 4: Style and Register": {
                completed: false,
                quizScores: [73] 
            },
        },
        Grammar_6: {
            "Lesson 1: Debating and Persuasion": {
                completed: false,
                quizScores: [81] 
            },
            "Lesson 2: Storytelling and Narration": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 3: Academic and Formal Writing": {
                completed: false,
                quizScores: [71] 
            },
            "Lesson 4: Humor and Playfulness in Language": {
                completed: false,
                quizScores: [83] 
            },
        }
    },
    comprehension: {
        Comprehension_1: {
            "Lesson 1: Understanding Basic Greetings and Introductions": {
                completed: false,
                quizScores: [91] 
            },
            "Lesson 2: Numbers and Time": {
                completed: false,
                quizScores: [98] 
            },
            "Lesson 3: Common Phrases and Responses": {
                completed: false,
                quizScores: [73] 
            },
            "Lesson 4: Simple Instructions and Commands": {
                completed: false,
                quizScores: [61] 
            },
        },
        Comprehension_2: {
            "Lesson 1: Shopping Conversations": {
                completed: false,
                quizScores: [73] 
            },
            "Lesson 2: Restaurant and Food": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 3: Directions and Transportation": {
                completed: false,
                quizScores: [97] 
            },
            "Lesson 4: Weather and Seasons": {
                completed: false,
                quizScores: [82] 
            },
        },
        Comprehension_3: {
            "Lesson 1: Educational Content": {
                completed: false,
                quizScores: [93] 
            },
            "Lesson 2: Work and Occupation Dialogues": {
                completed: false,
                quizScores: [71] 
            },
            "Lesson 3: Health and Wellness": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 4: Entertainment and Media": {
                completed: false,
                quizScores: [91] 
            },
        },
        Comprehension_4: {
            "Lesson 1: Narratives and Storytelling": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 2: Opinions and Arguments": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 3: Cultural and Historical Texts": {
                completed: false,
                quizScores: [73] 
            },
            "Lesson 4: Technical and Scientific Articles": {
                completed: false,
                quizScores: [81] 
            },
        },
        Comprehension_5: {
            "Lesson 1: Abstract and Philosophical Texts": {
                completed: false,
                quizScores: [72] 
            },
            "Lesson 2: Poetry and Literature": {
                completed: false,
                quizScores: [75] 
            },
            "Lesson 3: News and Current Events": {
                completed: false,
                quizScores: [76] 
            },
            "Lesson 4: Formal and Academic Papers": {
                completed: false,
                quizScores: [72] 
            },
        },
        Comprehension_6: {
            "Lesson 1: Interactive Scenarios and Role Plays": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 2: Listening and Audio Comprehension": {
                completed: false,
                quizScores: [91] 
            },
            "Lesson 3: Visual Comprehension and Interpretation": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 4: Comprehension Through Creation": {
                completed: false,
                quizScores: [73] 
            },
        }
    },
    math: {
        Math_1: {
            "Lesson 1: Introduction to Base-12 System": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 2: Counting in Base-12": {
                completed: false,
                quizScores: [91] 
            },
            "Lesson 3: Basic Operations in Base-12": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 4: Multiplication and Division in Base-12": {
                completed: false,
                quizScores: [83] 
            },
        },
        Math_2: {
            "Lesson 1: Carrying and Borrowing in Base-12": {
                completed: false,
                quizScores: [71] 
            },
            "Lesson 2: Advanced Multiplication and Division": {
                completed: false,
                quizScores: [91] 
            },
            "Lesson 3: Fractions in Base-12": {
                completed: false,
                quizScores: [82] 
            },
            "Lesson 4: Converting Between Base-10 and Base-12": {
                completed: false,
                quizScores: [71] 
            },
        },
        Math_3: {
            "Lesson 1: Base-12 Place Values": {
                completed: false,
                quizScores: [84] 
            },
            "Lesson 2: Using Base-12 in Practical Situations": {
                completed: false,
                quizScores: [74] 
            },
            "Lesson 3: Decimals in Base-12": {
                completed: false,
                quizScores: [57] 
            },
            "Lesson 4: Ratios and Proportions in Base-12": {
                completed: false,
                quizScores: [54] 
            },
        },
        Math_4: {
            "Lesson 1: Geometric Shapes and Measurements in Base-12": {
                completed: false,
                quizScores: [75] 
            },
            "Lesson 2: Algebraic Expressions in Base-12": {
                completed: false,
                quizScores: [83] 
            },
            "Lesson 3: Graphing in Base-12": {
                completed: false,
                quizScores: [85] 
            },
            "Lesson 4: Statistics and Probability in Base-12": {
                completed: false,
                quizScores: [73] 
            },
        },
        Math_5: {
            "Lesson 1: Mathematical Puzzles in Base-12": {
                completed: false,
                quizScores: [83] 
            },
            "Lesson 2: Exploring Patterns and Sequences in Base-12": {
                completed: false,
                quizScores: [75] 
            },
            "Lesson 3: Base-12 in Science and Technology": {
                completed: false,
                quizScores: [77] 
            },
            "Lesson 4: Theoretical Math in Base-12": {
                completed: false,
                quizScores: [88] 
            },
        }
    },
    // Include other modules and submodules as necessary
};

// Placeholder for recommended module, submodule, and lessons
const recommendations = {
    module: "vocabulary",
    subModule: "Vocabulary_1",
    lessons: ["Lesson 1: Common Phrases"]
    // Assuming at least one lesson is recommended
};

document.addEventListener('DOMContentLoaded', () => {
    // initializeDashboard();
});