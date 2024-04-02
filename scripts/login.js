import { db, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// check for a display name that was generated using the name generator and apply it automatically
// on account creation
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if there's a pending name save after login/account creation
        // If so, update the displayName in userProfiles
        const pendingNameSave = localStorage.getItem('pendingNameSave');
        if (pendingNameSave) {
            saveGeneratedName(user, pendingNameSave);
            localStorage.removeItem('pendingNameSave'); // Clear the pending name after saving
        }
    } 
});

// Function to handle user login
function login() {
    const email = document.getElementById('userEmail').value.trim();
    const password = selectedPoints.map(point => point.num).join("");
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!email || !password) {
        loginErrorMessage.textContent = "Please enter both email and password.";
        setTimeout(() => loginErrorMessage.textContent = '', 3000); // Clears the message after 3 seconds
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = 'dashboard.html'; // Redirect on successful login
        })
        .catch((error) => {
            console.error("Login error: ", error);
            loginErrorMessage.textContent = error.message;
        });
}

// Function to handle user account creation
async function createAccount() {
    const email = document.getElementById('userEmail').value.trim();
    const password = selectedPoints.map(point => point.num).join("");
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!email || !password) {
        loginErrorMessage.textContent = "Please enter both email and password.";
        return;
    }

    // Check for password length
    if (password.length < 8 || password.length > 16) {
        loginErrorMessage.textContent = "Password must be between 8 and 16 characters.";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await initializeUserProfile(user);
        // Redirect or further actions upon successful account creation and profile initialization
        window.location.href = 'dashboard.html'; // Redirect to the dashboard or another page as needed
    } catch (error) {
        console.error("Signup error: ", error);
        loginErrorMessage.textContent = error.message;
        // Handle specific errors, like displaying messages to users
    }
}

async function initializeUserProfile(user) {
    const userProfileData = {
        displayName: "New User", // Default display name or use input from user
        email: user.email, // Save email to user profile for easy access
        // Include other initial fields as necessary
        settings: {
            learningPace: "medium",
            contentPreferences: {
                vocabulary: true,
                grammar: true,
                culture: true,
                pronunciation: true,
            },
            notificationSettings: "weekly",
            languageInterface: "english",
            audioSpeed: "normal",
            dailyGoals: "",
            learningPath: "guided",
            privacySettings: "public",
            feedbackFrequency: "daily"
        }
    }
    await setDoc(doc(db, 'userProfiles', user.uid), userProfileData);
    console.log('User profile initialized.');
}

// Function to save the generated name to the user's profile
function saveGeneratedName(user, generatedName) {
    db.collection('userProfiles').doc(user.uid).set({displayName: generatedName}, {merge: true})
        .then(() => {
            alert('Name saved to your profile successfully!');
            // Clear any pending name save after successful save
            // localStorage.removeItem('pendingNameSave');
        })
        .catch(error => {
            console.error("Error saving name to profile: ", error);
            alert('There was a problem saving your name. Please try again.');
        });
}

// to extract the password:
// selectedPoints.map(point => point.num).join("-");

// Display numbers in a circle, drawing lines between every one
let selectedPoints = []; // Store the sequence of selected points
const svgContainer = document.getElementById('linesContainer');

// Modified to only position numbers, not draw lines initially
function positionNumbers() {
    const numbers = document.querySelectorAll('.number');
    const radius = 150; // Circle radius
    numbers.forEach((num, index) => {
        const angle = ((2 * Math.PI) / numbers.length) * index - Math.PI / 2;
        const x = radius * Math.cos(angle) + radius;
        const y = radius * Math.sin(angle) + radius;
        num.style.left = `${x}px`;
        num.style.top = `${y}px`;

        // Add click event listener for each number to handle selection
        num.addEventListener('click', () => handleSelection(num, {x, y}));
    });
}

// Handle selection of a point
function handleSelection(num, position) {
    // Extract the point's value from the data-value attribute
    const pointValue = num.getAttribute('data-value');

    // Prevent consecutive selections of the same number
    if (selectedPoints.length > 0 && selectedPoints[selectedPoints.length - 1].num === pointValue) {
        console.log("Consecutive selections of the same point are not allowed.");
        return; // Exit the function if the current point is the same as the last one
    }

    if (selectedPoints.length > 0) {
        const lastPoint = selectedPoints[selectedPoints.length - 1].position;
        drawLine(svgContainer, lastPoint, position, selectedPoints.length); // Pass length for color differentiation
    }
    selectedPoints.push({num: num.getAttribute("data-value"), position}); // Store the data-value attribute instead of the element itself
    updateInfoArea(); // Update the info area with the current sequence
}

function drawLine(container, startPoint, endPoint, index) {
    const colors = ["#e6194B", "#f58231", "#ffe119", "#bfef45", "#3cb44b", "#42d4f4", "#4363d8", "#911eb4", "#f032e6", "#a9a9a9", "#ffffff"];
    const lineColor = colors[index % colors.length]; // Cycle through colors
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startPoint.x);
    line.setAttribute("y1", startPoint.y);
    line.setAttribute("x2", endPoint.x);
    line.setAttribute("y2", endPoint.y);
    line.setAttribute("stroke", lineColor);
    line.setAttribute("stroke-width", "2");
    container.appendChild(line);
}

function clearPassword() {
    const passwordArea = document.getElementById('passwordArea');

    passwordArea.textContent = ""; // Clear the displayed password pattern
    selectedPoints = []; // Clear the current password sequence
    
    // remove the drawn lines
    while (svgContainer.firstChild) {
        svgContainer.removeChild(svgContainer.firstChild);
    }
}

function updateInfoArea(message = "") {
    const infoArea = document.getElementById('passwordArea');
    if (message) {
        // If a message is provided, display it directly
        infoArea.textContent = message;
        return;
    }
    // If no message is provided, proceed to display the password pattern
    infoArea.textContent = selectedPoints.map(point => point.num).join("");
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    positionNumbers();

    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('signupButton').addEventListener('click', createAccount);
    document.getElementById('clearPasswordButton').addEventListener('click', clearPassword);
});