function saveSettings() {
    //const learningPace = document.getElementById('learningPace').value;
    //const notificationSettings = document.getElementById('notificationSettings').value;
    //const theme = document.querySelector('input[name="theme"]:checked').value;
    //const languageInterface = document.getElementById('languageInterface').value;
    //const audioSpeed = document.querySelector('input[name="audioSpeed"]:checked').value;
    //const dailyGoals = document.getElementById('dailyGoals').value;
    //const learningPath = document.querySelector('input[name="learningPath"]:checked').value;
    //const privacySettings = document.getElementById('privacySettings').value;
    //const feedbackFrequency = document.getElementById('feedbackFrequency').value;

    // Fetch existing userSettings or initialize an empty object
    const userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
    // Save the updated userSettings back to localStorage
    localStorage.setItem('userSettings', JSON.stringify(userSettings));

    const saveConfirmation = document.getElementById('saveConfirmation');
    saveConfirmation.textContent = 'Settings saved successfully!';

     // Clear the message after a delay
     setTimeout(() => saveConfirmation.textContent = '', 3000); // Clears the message after 3 seconds
}

// Optional: A function to load and apply settings from localStorage when the page loads
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (!settings) return;

    document.getElementById('learningPace').value = settings.learningPace;
    document.getElementById('notificationSettings').value = settings.notificationSettings;

    settings.contentPreferences.forEach(pref => {
        document.querySelector(`input[name="contentPref"][value="${pref}"]`).checked = true;
    });

    // Apply theme based on settings, etc.
}

// Add event listeners or initialization logic here
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    // Assuming your save button has an id="saveSettingsButton"
    document.getElementById('saveSettingsButton').addEventListener('click', saveSettings);
});