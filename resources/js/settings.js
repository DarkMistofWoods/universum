import { db, auth, fetchUserSettings, saveSettings, saveProfile } from './firebase-config.js';

// Default settings (remove this if not needed anymore)
const defaultSettings = {
    audioSpeed: 'normal',
    contentPreferences: ['vocabulary', 'grammar', 'cultural', 'pronunciation'],
    feedbackFrequency: 'weekly',
    languageInterface: 'english',
    learningPace: 'medium',
    learningPath: 'guided',
    notificationSettings: 'weekly',
    privacySettings: 'private',
};

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const settings = await fetchUserSettings(user.uid);

        if (settings) {
            document.querySelector('[name="learning-pace"]').value = settings.learningPace;
            document.querySelectorAll('[name="content-pref"]').forEach(checkbox => {
                checkbox.checked = settings.contentPreferences.includes(checkbox.value);
            });
            document.querySelector('[name="notifications"]').value = settings.notificationSettings;
            document.querySelector('[name="language-interface"]').value = settings.languageInterface;
            document.querySelector(`[name="audio-speed"][value="${settings.audioSpeed}"]`).checked = true;
            document.querySelector(`[name="learning-path"][value="${settings.learningPath}"]`).checked = true;
            document.querySelector('[name="privacy"]').value = settings.privacySettings;
            document.querySelector('[name="feedback"]').value = settings.feedbackFrequency;
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
    } else {
        // Handle the case when the user is not authenticated
        console.log('User is not authenticated.');
        window.location.href = '../../login.html';
    }
});