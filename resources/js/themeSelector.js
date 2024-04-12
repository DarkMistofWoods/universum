// remember to add this to the head of the html file
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'theme-light';
    setTheme(savedTheme);
});

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icon visibility based on the current theme
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (theme === 'theme-dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

document.getElementById('sunIcon').addEventListener('click', toggleTheme);
document.getElementById('moonIcon').addEventListener('click', toggleTheme);

function toggleTheme() {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'theme-dark' ? 'theme-light' : 'theme-dark';
    setTheme(newTheme);
}