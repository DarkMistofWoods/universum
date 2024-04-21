import { auth, onAuthStateChanged, fetchUserAchievements } from './firebase-config.js';

// Main function to display achievements on the page
async function displayAchievements(userId) {
    const userAchievements = await fetchUserAchievements(userId);

    const achievementsContainer = document.getElementById('achievementContent');
    let achievementsHTML = '<h2>Your Achievements</h2>';

    if (userAchievements) {
        Object.entries(userAchievements).forEach(([achievementId, achievement]) => {
            const progress = achievement.progress || 0;
            const target = achievement.target;
            const percentage = (progress / target) * 100;

            achievementsHTML += `
                <div class="achievement-section">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-progress">${progress} / ${target}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
    } else {
        achievementsHTML += '<p>No achievements found.</p>';
    }

    achievementsContainer.innerHTML = achievementsHTML;
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            const userId = user.uid;
            displayAchievements(userId);
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