import { auth } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';

// Function to handle sign-out
async function handleSignOut() {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        // Redirect to the login page or any other appropriate page
        window.location.href = './index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Get the sign-out icon element
const signOutIcon = document.getElementById('signout-icon');

// Add click event listener to the sign-out icon
signOutIcon.addEventListener('click', handleSignOut);