import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not signed in, redirect to login.html
        window.location.href = 'login.html';
    } else {
        // User is signed in, continue with page-specific logic
    }
});

// Simulated user data
const userData = {
    overallProgress: 44, // Assuming a percentage
    modules: [
        { name: "menuvokisi", progress: 75 },
        { name: "vokilana", progress: 60 },
        { name: "tukidepi", progress: 30 },
        { name: "lana", progress: 10 }
    ],
    strengths: ["menuvokisi (Grammar)", "vokilana (Vocabulary)"],
    weaknesses: ["tukidepi (Comprehension)", "lana (Math)"],
    nextSteps: "Focus on tukidepi to improve your conversation skills."
};

// Convert numbers to Universum base-12 system
function convertToUniversumNumber(number) {
    // Conversion logic here
    // Placeholder for conversion, replace with actual logic
    return `${number} (Placeholder for Universum Number)`;
}

// Display overall progress using Chart.js
function displayOverallProgress(progress) {
    const ctx = document.getElementById('overall-progress').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                label: 'Overall Progress',
                data: [progress, 100 - progress],
                backgroundColor: ['rgb(149, 191, 184)', 'rgb(95, 115, 111)'],
                borderColor: 'transparent', // Specify border colors here
                borderWidth: 1, // Adjust border width as needed
                borderRadius: 20,
            }]
        },
        options: {
            responsive: true,
            legend: {
                labels: {
                    // This more specific font color setting overrides the global setting
                    fontColor: '#95BFB8',
                    boxWidth: 20,
                    padding: 20
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#95BFB8', // Set legend text color
                        padding: 20,
                        boxWidth: 20
                        // Additional legend styling options here
                    }
                }
            }
        }
    });
}

// Display module progress using Chart.js
function displayModuleProgress(modules) {
    const ctx = document.getElementById('module-progress-bars').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: modules.map(module => module.name),
            datasets: [{
                label: 'Module Progress',
                data: modules.map(module => module.progress),
                backgroundColor: 'rgb(149, 191, 184)',
                borderRadius: 20, // Apply rounded corners to bars
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Display strengths in the dashboard
function displayStrengths(strengths) {
    const container = document.getElementById('strengths');
    container.innerHTML = '<h3>Strengths</h3>'; // Clear existing content and add header
    strengths.forEach(strength => {
        const item = document.createElement('p');
        item.textContent = strength;
        container.appendChild(item);
    });
}

// Display weaknesses in the dashboard
function displayWeaknesses(weaknesses) {
    const container = document.getElementById('weaknesses');
    container.innerHTML = '<h3>Weaknesses</h3>'; // Clear existing content and add header
    weaknesses.forEach(weakness => {
        const item = document.createElement('p');
        item.textContent = weakness;
        container.appendChild(item);
    });
}

// Display next steps in the dashboard
function displayNextSteps(nextSteps) {
    const container = document.getElementById('next-steps-content');
    container.textContent = nextSteps; // Set text for next steps
}
 
// Update the initializeDashboard function to call initializeGreeting
async function initializeDashboard() {
    const user = auth.currentUser;
    if (user) {
        // Reference to the user's progress document
        const userProgressRef = doc(db, 'userProgress', user.uid);
        // Asynchronously fetch the document
        const progressDoc = await getDoc(userProgressRef);
        if (progressDoc.exists()) {
            const progressData = progressDoc.data();
            displayOverallProgress(progressData.overallProgress);
            displayModuleProgress(progressData.modules);
            displayStrengths(progressData.strengths);
            displayWeaknesses(progressData.weaknesses);
            displayNextSteps(progressData.nextSteps);
        } else {
            console.log("No progress found.");
        }

        // Reference to the user's settings document
        const userProfilesRef = doc(db, 'userProfiles', user.uid);
        // Asynchronously fetch the document
        const profilesDoc = await getDoc(userProfilesRef);
        if (profilesDoc.exists()) {
            const profileData = profilesDoc.data();
            document.getElementById('userName').textContent = profileData.displayName || "Welcome, User!";
            // Apply other settings as necessary
        } else {
            console.log("No profile found.");
        }
    } else {
        console.log("No user signed in.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});