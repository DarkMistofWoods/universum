import { auth, handleLogout } from './firebase-config.js';

// Function to update the visibility of minidash icons based on user authentication state
function updateMinidashIcons(user) {
    const minidashIcons = document.querySelectorAll('.minidash-icon');
    minidashIcons.forEach(icon => {
        icon.style.display = user ? 'block' : 'none';
    });

    // Get the sign-out icon element
    const signOutIcon = document.getElementById('signout-icon');
    
    // Add click event listener to the sign-out icon
    signOutIcon.addEventListener('click', handleLogout);
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            updateMinidashIcons(user);
        } else {
            // User is signed out
            console.log('User is signed out. No icons to display.');
        }
    });
}

// Call the main function when the page loads
window.addEventListener('DOMContentLoaded', checkAuthState);