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

// Listen for changes in the user's authentication state
auth.onAuthStateChanged(user => {
    updateMinidashIcons(user);
});