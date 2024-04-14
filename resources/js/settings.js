import { db, auth } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc  } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Default settings
const defaultSettings = {
    learningPace: 'medium',
    contentPreferences: [],
    notificationSettings: 'never',
    languageInterface: 'english',
    audioSpeed: 'normal',
    dailyGoals: '',
    learningPath: 'guided',
    privacySettings: 'private',
    feedbackFrequency: 'weekly'
};

async function saveSettings(userId, settings) {
    try {
        const userProfileRef = doc(db, 'userProfiles', userId);
        await setDoc(userProfileRef, { settings }, { merge: true });
        console.log('Settings saved successfully.');
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

async function loadSettings(userId) {
    try {
        const userProfileRef = doc(db, 'userProfiles', userId);
        const docSnapshot = await getDoc(userProfileRef);
        if (docSnapshot.exists()) {
            return docSnapshot.data().settings || defaultSettings;
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
        await auth.currentUser.updateEmail(newEmail);
        const userProfileRef = doc(db, 'userProfiles', userId);
        await updateDoc(userProfileRef, { email: newEmail });
        console.log('Email updated successfully.');
    } catch (error) {
        console.error('Error updating email:', error);
    }
}

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = auth.currentUser.uid;

    const settings = {
        learningPace: document.querySelector('[name="learning-pace"]').value,
        contentPreferences: Array.from(document.querySelectorAll('[name="content-pref"]:checked')).map(checkbox => checkbox.value),
        notificationSettings: document.querySelector('[name="notifications"]').value,
        languageInterface: document.querySelector('[name="language-interface"]').value,
        audioSpeed: document.querySelector('[name="audio-speed"]:checked').value,
        dailyGoals: document.querySelector('[name="daily-goals"]').value,
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
        document.querySelector('[name="daily-goals"]').value = settings.dailyGoals;
        document.querySelector(`[name="learning-path"][value="${settings.learningPath}"]`).checked = true;
        document.querySelector('[name="privacy"]').value = settings.privacySettings;
        document.querySelector('[name="feedback"]').value = settings.feedbackFrequency;
    } else {
        // Handle the case when the user is not authenticated
        console.log('User is not authenticated.');
        window.location.href = '../../login.html';
    }
});