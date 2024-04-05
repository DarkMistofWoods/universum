import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// page protection for non-members
auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not signed in, redirect to login.html
        window.location.href = 'login.html';
    } else {
        // User is signed in, continue with page-specific logic
        loadUserSettings(user)
    }
});

async function saveSettings(user) {
    if (user) {
        const userDocRef = doc(db, 'userProfiles', user.uid);
        const userProfileData = { // only modify the settings
            settings: {
                learningPace: document.getElementById('learningPace').value,
                contentPreferences: {
                    vocabulary: document.getElementById('vocabFocus').checked,
                    grammar: document.getElementById('grammarExercises').checked,
                    culture: document.getElementById('culturalInsights').checked,
                    pronunciation: document.getElementById('pronunciationPractice').checked,
                },
                notificationSettings: document.getElementById('notificationSettings').value,
                languageInterface: document.getElementById('languageInterface').value,
                audioSpeed: document.querySelector('input[name="audioSpeed"]:checked').value,
                dailyGoals: document.getElementById('dailyGoals').value,
                learningPath: document.querySelector('input[name="learningPath"]:checked').value,
                privacySettings: document.getElementById('privacySettings').value,
                feedbackFrequency: document.getElementById('feedbackFrequency').value
                // Add other settings as needed
            }
        }

        try {
            await setDoc(userDocRef, userProfileData, { merge: true });
            document.getElementById('saveConfirmation').textContent = 'Settings saved successfully!';
            setTimeout(() => document.getElementById('saveConfirmation').textContent = '', 3000); // Clears the message after 3 seconds
        } catch (error) {
            console.error("Error saving settings: ", error);
        }
    } else {
        console.log("No user signed in.");
    }
}

// A function to load and apply settings stored in userProfiles when the page loads
async function loadUserSettings(user) {
    if (user) {
        const userDocRef = doc(db, 'userProfiles', user.uid);

        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const userProfile = docSnap.data(); // does this correctly retrieve the settings data from within the userProfile doc?
                const settings = userProfile.settings; // This line is crucial if your settings are nested

                // Populate the form with these settings
                document.getElementById('learningPace').value = settings.learningPace || 'medium';
                document.getElementById('vocabFocus').checked = settings.contentPreferences?.vocabulary || true;
                document.getElementById('grammarExercises').checked = settings.contentPreferences?.grammar || true;
                document.getElementById('culturalInsights').checked = settings.contentPreferences?.culture || true;
                document.getElementById('pronunciationPractice').checked = settings.contentPreferences?.pronunciation || true;
                document.getElementById('notificationSettings').value = settings.notificationSettings || 'weekly';
                document.getElementById('dailyGoals').value = settings.dailyGoals || '';
                document.getElementById('privacySettings').value = settings.privacySettings || 'public';
                document.getElementById('feedbackFrequency').value = settings.feedbackFrequency || 'daily';

                // Handle radio buttons
                if (settings.learningPath) {
                    document.querySelector(`input[name="learningPath"][value="${settings.learningPath}"]`).checked = true;
                } else {
                    document.querySelector(`input[name="learningPath"][value="guided"]`).checked = true;
                }
                if (settings.languageInterface) {
                    document.getElementById('languageInterface').value = settings.languageInterface;
                } else {
                    document.getElementById('languageInterface').value = 'English';
                }
                if (settings.audioSpeed) {
                    document.querySelector(`input[name="audioSpeed"][value="${settings.audioSpeed}"]`).checked = true;
                }
            } else {
                console.log("No settings document found for this user.");
            }
        } catch (error) {
            console.error("Error loading user settings:", error);
        }
    }
}

// Add event listeners or initialization logic here
document.addEventListener('DOMContentLoaded', () => {
    // Assuming your save button has an id="saveSettingsButton"
    document.getElementById('saveSettingsButton').addEventListener('click', () => {
        auth.currentUser && saveSettings(auth.currentUser);
    });
});