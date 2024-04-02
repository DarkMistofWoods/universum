import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase-config.js';

function login() { // doubles as a 'sign up' function
    const email = document.getElementById('userEmail').value.trim();
    const loginErrorMessage = document.getElementById('loginErrorMessage'); // Reference to the new error message span
    const password = selectedPoints.map(point => point.num).join("");

    if (selectedPoints.length < 8 || selectedPoints.length > 16) {
        loginErrorMessage.textContent = "Your password must be 8-16 characters long.";
        clearPassword();
        setTimeout(() => loginErrorMessage.textContent = '', 3000); // Clears the message after 3 seconds
        return false; // Prevent further execution
    } 

    if (!email || !password) {
        loginErrorMessage.textContent = "Please enter both email and password.";
        clearPassword();
        setTimeout(() => loginErrorMessage.textContent = '', 3000); // Clears the message after 3 seconds
        return false;
    }
    
    console.log(`Logging in with email ${email} and password ${password}`);
    // Attempt to sign in
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Sign-in success, redirect to dashboard
            window.location.href = 'dashboard.html'; // Redirect only if login is successful
        })
        .catch((error) => {
            
            console.error("Login error: ", error);
            switch (error.code) {
                case 'auth/invalid-email':
                    loginErrorMessage.textContent = 'The email address is improperly formatted.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    loginErrorMessage.textContent = 'Incorrect email or password.';
                    break;
                default:
                    loginErrorMessage.textContent = `Login error: ${error.message}`;
                    break;
            }

            // Handle login errors
            if (error.code === 'auth/user-not-found') {
                // User not found, attempt to sign up
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Sign up success, now initialize profile if it doesn't exist
                        const userProfileRef = db.collection('userProfiles').doc(userCredential.user.uid);
    
                        userProfileRef.get().then((doc) => {
                            if (!doc.exists) {
                                // Initialize profile since it doesn't exist
                                userProfileRef.set({
                                    // Set initial profile data here
                                    displayName: "user", // Or use any default or placeholder values
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
                                        // Add other settings as needed
                                    }
                                }, { merge: true }).then(() => {
                                    console.log('New user profile initialized.');
                                    window.location.href = 'dashboard.html'; // Redirect to the dashboard
                                });
                            } else {
                                // Profile already exists, just redirect
                                window.location.href = 'dashboard.html';
                            }
                        });
                    })
                    .catch((signUpError) => {
                        // Handle sign-up errors
                        console.error("Error during account creation: ", signUpError);
                    });
            } else {
                // Handle other login errors
                loginErrorMessage.textContent = `Error: ${error.message}`; // Display the error message
                clearPassword()
                console.error("Login error: ", error);
            }
        });
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Check if there's a pending name save after login
            const pendingNameSave = localStorage.getItem('pendingNameSave');
            if (pendingNameSave) {
                saveGeneratedName(user, pendingNameSave);
                localStorage.removeItem('pendingNameSave'); // Clear the pending name after saving
            }
            window.location.href = 'dashboard.html';
        }
    });
}

// Function to save the generated name to the user's profile
function saveGeneratedName(user, generatedName) {
    db.collection('userProfiles').doc(user.uid).set({displayName: generatedName}, {merge: true})
        .then(() => {
            alert('Name saved to your profile successfully!');
            // Clear any pending name save after successful save
            localStorage.removeItem('pendingNameSave');
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
    infoArea.textContent = selectedPoints.map(point => point.num).join("-");
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    positionNumbers()

    const loginButton = document.getElementById('loginButton');
    const clearPasswordButton = document.getElementById('clearPasswordButton');

    loginButton.addEventListener('click', login);
    clearPasswordButton.addEventListener('click', clearPassword);
});