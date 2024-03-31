// Simulated user data
const userData = {
    overallProgress: 50, // Assuming a percentage
    modules: [
        { name: "Fali Voki (Tree Voice)", progress: 75 },
        { name: "Kaso Miso (Make Talk)", progress: 60 }
    ],
    strengths: ["Fali Voki"],
    weaknesses: ["Kaso Miso"],
    nextSteps: "Focus on Kaso Miso to improve your conversation skills."
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

// Function to update user name based on input
function updateUserName() {
    const userNameInput = document.getElementById('userDisplayName').value.trim();
    if (userNameInput) {
        document.getElementById('userName').textContent = userNameInput;
        // Save to local storage for persistence
        localStorage.setItem('userName', userNameInput);
    }
}

// Initialize the greeting with the user's name from local storage if available
function initializeGreeting() {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        document.getElementById('userName').textContent = storedName;
    }
}

// Update the initializeDashboard function to call initializeGreeting
function initializeDashboard() {
    initializeGreeting();
    displayOverallProgress(userData.overallProgress);
    displayModuleProgress(userData.modules);
    displayStrengths(userData.strengths);
    displayWeaknesses(userData.weaknesses);
    displayNextSteps(userData.nextSteps);
}

function saveSettings() {
    const learningPace = document.getElementById('learningPace').value;
    const notificationSettings = document.getElementById('notificationSettings').value;
    const theme = document.querySelector('input[name="theme"]:checked').value;
    const languageInterface = document.getElementById('languageInterface').value;
    const audioSpeed = document.querySelector('input[name="audioSpeed"]:checked').value;
    const dailyGoals = document.getElementById('dailyGoals').value;
    const learningPath = document.querySelector('input[name="learningPath"]:checked').value;
    const privacySettings = document.getElementById('privacySettings').value;
    const feedbackFrequency = document.getElementById('feedbackFrequency').value;

    const contentPreferences = [];
    document.querySelectorAll('input[name="contentPref"]:checked').forEach((checkbox) => {
        contentPreferences.push(checkbox.value);
    });

    // Construct an object to hold all settings
    const settings = {
        learningPace, 
        notificationSettings, 
        theme, 
        contentPreferences,
        languageInterface,
        audioSpeed,
        dailyGoals: dailyGoals ? parseInt(dailyGoals, 10) : undefined,
        learningPath,
        privacySettings,
        feedbackFrequency
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));

    alert('Settings saved successfully!');
}

// Optional: A function to load and apply settings from localStorage when the page loads
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (!settings) return;
    if (settings && settings.generatedName) {
        // Update the display element with the saved name
        // For example, if you have an element to display the user's name:
        document.getElementById('userName').textContent = settings.generatedName;
    }

    document.getElementById('learningPace').value = settings.learningPace;
    document.getElementById('notificationSettings').value = settings.notificationSettings;
    document.querySelector(`input[name="theme"][value="${settings.theme}"]`).checked = true;

    settings.contentPreferences.forEach(pref => {
        document.querySelector(`input[name="contentPref"][value="${pref}"]`).checked = true;
    });

    // Apply theme based on settings, etc.
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

// Ensure to call initializeDashboard to execute these functions
initializeDashboard();