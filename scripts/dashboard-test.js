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

// optimize this function!
async function initializeDashboard(user) {
    try {
        const userProfilesRef = doc(db, 'userProfiles', user.uid);
        const profilesDoc = await getDoc(userProfilesRef);
        
        if (profilesDoc.exists()) {
            const profileData = profilesDoc.data();
            document.getElementById('userName').textContent = profileData.displayName || "New user";
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
            
            detailedStats = preprocessGlobalDummyProgress(dummyProgress);
            renderCustomNetworkVisualization(dummyProgress); // Use demo data
            updateStats(dummyProgress);
        }

        initializeStatsInteraction(detailedStats);
    } catch (error) {
        console.error("Error initializing dashboard: ", error);
    }
}

// generalized function to process learning units with a provided operation
function processLearningUnits(units, operation, path = []) {
    units.forEach(unit => {
        const unitPath = [...path, unit.name];
        operation(unit, unitPath); // Perform the specified operation on each unit

        // Recursively process submodules and lessons, if they exist
        if (unit.submodules) {
            processLearningUnits(unit.submodules, operation, unitPath);
        }
        if (unit.lessons) {
            processLearningUnits(unit.lessons, operation, unitPath);
        }
    });
}

// loads data from a JSON file and handles errors
async function loadData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not load the data:", error);
    }
}

// determines the status of modules, submodules, and lessons in the user's progress data and returns the data
function determineAllStatuses(progressData) {
    let statusMap = {};

    // Function to recursively determine status
    function setStatus(unit, path = []) {
        const isRecommended = recommendations.lessons.includes(unit.name);
        const unitPath = [...path, unit.name];
        const unitKey = unitPath.join(" > "); // Unique key generation based on the hierarchy

        if (isRecommended) {
            statusMap[unitKey] = 'recommended';
        } else if (unit.completed) {
            statusMap[unitKey] = 'completed';
        } else if (unit.quizScores && unit.quizScores.length) {
            statusMap[unitKey] = 'connected';
        } else {
            statusMap[unitKey] = 'notDisplayed';
        }

        // If the unit has children (submodules or lessons), recursively determine their status
        if (unit.submodules) {
            unit.submodules.forEach(submodule => setStatus(submodule, unitPath));
        }
        if (unit.lessons) {
            unit.lessons.forEach(lesson => setStatus(lesson, unitPath));
        }
    }

    // Initial call for each top-level module
    learningUnits.forEach(unit => setStatus(unit));

    return statusMap;
}

// handles the rendering of nodes, lines, and labels for SVG visualization
function renderElement(type, attributes, parentElement) {
    const ns = 'http://www.w3.org/2000/svg';
    const element = document.createElementNS(ns, type);
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
    parentElement.appendChild(element);
    return element;
}

// manages interactions for all nodes
function setupEventListeners(selector, eventHandlers) {
    document.querySelector(selector).addEventListener('click', event => {
        const target = event.target.closest('.interactive-node');
        if (!target) return;
        const nodeId = target.dataset.name;
        eventHandlers.click && eventHandlers.click(nodeId, event);
    });
    // Add mouseenter and mouseleave event listeners
}

// preprocesses user progress data to calculate and summarize stats
function processUserProgress(progressData) {
    // Iterate through progressData and calculate stats
    return {
        totalLessonsCompleted: '/* ... */',
        totalModulesCompleted: '/* ... */',
        averageQuizScore: '/* ... */',
        // Any other relevant stats
    };
}

// manages the SVG visualization
function updateSVGVisualization(data) {
    const svg = document.querySelector('#networkVisualization svg');
    // Clear existing content
    svg.innerHTML = '';

    // Rebuild visualization based on the updated data
    data.modules.forEach(module => {
        // Render modules, submodules, and lessons
    });

    // Adjust viewBox or perform any other necessary updates
}

// Placeholder for recommended lessons
const recommendations = {
    lessons: ["Lesson 1: Common Phrases"]
};