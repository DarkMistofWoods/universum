import { db, auth, fetchUserSettings } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Default settings
const defaultSettings = {
    audioSpeed: 'normal',
    contentPreferences: ['vocabulary', 'grammar', 'cultural', 'pronunciation'],
    feedbackFrequency: 'weekly',
    languageInterface: 'english',
    learningPace: 'medium',
    learningPath: 'default',
    notificationSettings: 'weekly',
    privacySettings: 'default',
};

async function saveSettings(userId, settings) {
    try {
        const userSettingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
        await setDoc(userSettingsRef, settings, { merge: true });
        // console.log('Settings saved successfully.');
        document.querySelector('.settings-info').textContent = 'Settings saved successfully.';
    } catch (error) {
        console.error('Error saving settings:', error);
        document.querySelector('.settings-info').textContent = 'Error saving settings. Please try again.';
    }
}

async function loadSettings(userId) {
    try {
        const userSettingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
        const docSnapshot = await getDoc(userSettingsRef);
        if (docSnapshot.exists()) {
            return docSnapshot.data() || defaultSettings;
        } else {
            return defaultSettings;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
    }
}

async function updateEmail(userId, newEmail) {
    try {
        const user = auth.currentUser;
        await user.verifyBeforeUpdateEmail(newEmail);
        const userProfileRef = doc(db, 'users', userId, 'profile', 'profileData');
        await updateDoc(userProfileRef, { email: newEmail });
        console.log('Email verification sent successfully.');
        document.getElementById('email-info').textContent = 'Email verification sent. Please check your inbox.';
    } catch (error) {
        console.error('Error updating email:', error);
        document.getElementById('email-info').textContent = 'Error updating email. Please try again.';
    }
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const settings = await loadSettings(user.uid);

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
        
            await saveSettings(userId, settings);
        });
        
        document.querySelector('#update-email-form').addEventListener('submit', async (e) => {
            e.preventDefault();
        
            const userId = auth.currentUser.uid;
            const newEmail = document.querySelector('#new-email').value;
        
            await updateEmail(userId, newEmail);
        });
    } else {
        // Handle the case when the user is not authenticated
        console.log('User is not authenticated.');
        window.location.href = '../../login.html';
    }
});