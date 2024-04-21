import { auth, onAuthStateChanged, fetchUserSettings, saveSettings, saveProfile } from './firebase-config.js';

async function displaySettings(userId) {
    const userSettings = await fetchUserSettings(userId);

    if (userSettings) {
        document.querySelector('[name="learning-pace"]').value = userSettings.learningPace;
        document.querySelectorAll('[name="content-pref"]').forEach(checkbox => {
            checkbox.checked = userSettings.contentPreferences.includes(checkbox.value);
        });
        document.querySelector('[name="notifications"]').value = userSettings.notificationSettings;
        document.querySelector('[name="language-interface"]').value = userSettings.languageInterface;
        document.querySelector(`[name="audio-speed"][value="${userSettings.audioSpeed}"]`).checked = true;
        document.querySelector(`[name="learning-path"][value="${userSettings.learningPath}"]`).checked = true;
        document.querySelector('[name="privacy"]').value = userSettings.privacySettings;
        document.querySelector('[name="feedback"]').value = userSettings.feedbackFrequency;
    }
    
    document.getElementById('saveSettingsButton').addEventListener('click', async (e) => {
        e.preventDefault();
    
        const userId = auth.currentUser.uid;
    
        const settings = {
            learningPace: document.querySelector('[name="learning-pace"]').value,
            contentPreferences: Array.from(document.querySelectorAll('[name="content-pref"]:checked')).map(checkbox => checkbox.value),
            notificationSettings: document.querySelector('[name="notifications"]').value,
            languageInterface: document.querySelector('[name="language-interface"]').value,
            audioSpeed: document.querySelector('[name="audio-speed"]:checked').value,
            learningPath: document.querySelector('[name="learning-path"]:checked').value,
            privacySettings: document.querySelector('[name="privacy"]').value,
            feedbackFrequency: document.querySelector('[name="feedback"]').value
        };
    
        const statusMessage = await saveSettings(userId, settings);
        document.querySelector('.settings-info').textContent = statusMessage;
    });
    
    document.querySelector('#update-email-form').addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const userId = auth.currentUser.uid;
        const newEmail = document.querySelector('#new-email').value;
    
        const profileData = { email: newEmail };
        const statusMessage = await saveProfile(userId, profileData);
        document.getElementById('email-info').textContent = statusMessage;
    });
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            const userId = user.uid;
            displaySettings(userId);
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