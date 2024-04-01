document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme if not set
    updateTheme(savedTheme); // Apply the saved theme
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, show the authenticated icons
        document.getElementById('authIcons').style.display = 'block';
    } else {
        // No user is signed in, hide the authenticated icons
        document.getElementById('authIcons').style.display = 'none';
    }
});

function updateTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icon visibility based on the current theme
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

document.getElementById('sunIcon').addEventListener('click', toggleTheme);
document.getElementById('moonIcon').addEventListener('click', toggleTheme);

function toggleTheme() {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
}