import { db, auth, onAuthStateChanged, doc, getDoc, getDocs, collection } from './firebase-config.js';

// Function to fetch all possible achievements
async function fetchAllAchievements() {
    const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
    const achievements = [];
    achievementsSnapshot.forEach((doc) => {
        achievements.push({ id: doc.id, ...doc.data() });
    });
    return achievements;
}

// Function to fetch user's progress for each achievement
async function fetchUserAchievementsProgress(userId) {
    const userAchievementsSnapshot = await getDocs(collection(db, 'users', userId, 'achievements'));
    const userAchievements = {};
    userAchievementsSnapshot.forEach((doc) => {
        userAchievements[doc.id] = doc.data();
    });
    return userAchievements;
}

// Function to generate HTML markup for each achievement
function generateAchievementHTML(achievement, userProgress) {
    const progress = userProgress ? userProgress.progress : 0;
    const target = achievement.target;
    const percentage = (progress / target) * 100;

    return `
    <div class="achievement-container">
        <div class="achievement-header">
            <h3 class="achievement-title">${achievement.title}</h3>
            <p class="achievement-progress">${progress} / ${target}</p>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: ${percentage}%"></div>
        </div>
    </div>
  `;
}

// Main function to display achievements on the page
async function displayAchievements(userId) {
    const allAchievements = await fetchAllAchievements();
    const userAchievementsProgress = await fetchUserAchievementsProgress(userId);

    const achievementsContainer = document.querySelector('.container-secondary');
    let achievementsHTML = 'Your Achievements';

    allAchievements.forEach((achievement) => {
        const userProgress = userAchievementsProgress[achievement.id];
        achievementsHTML += generateAchievementHTML(achievement, userProgress);
    });

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
        }
    });
}

// Call the main function when the page loads
window.addEventListener('DOMContentLoaded', checkAuthState);