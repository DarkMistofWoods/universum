import { auth, saveSettings, saveProfile, handleLogin, handleSignup } from './firebase-config.js';

// Display numbers in a circle, drawing lines between every one
let selectedPoints = []; // Store the sequence of selected points

// Modified to only position numbers, not draw lines initially
function positionNumbers() {
    const numbers = document.querySelectorAll('.number');
    const radius = 125; // Circle radius
    const svgContainer = document.getElementById('linesContainer');

    numbers.forEach((num, index) => {
        const angle = ((2 * Math.PI) / numbers.length) * index - Math.PI / 2;
        const x = radius * Math.cos(angle) + radius;
        const y = radius * Math.sin(angle) + radius;
        num.style.left = `${x}px`;
        num.style.top = `${y}px`;

        // Add click event listener for each number to handle selection
        num.addEventListener('click', () => handleSelection(num, { x, y }, svgContainer));
    });
}

function generatePassword() {
    const passwordChars = {
        '0': ['a', 'b', 'c', 'd'],
        '1': ['e', 'f', 'g', 'h'],
        '2': ['i', 'j', 'k', 'l'],
        '3': ['m', 'n', 'o', 'p'],
        '4': ['q', 'r', 's', 't'],
        '5': ['u', 'v', 'w', 'x'],
        '6': ['y', 'z', 'A', 'B'],
        '7': ['C', 'D', 'E', 'F'],
        '8': ['G', 'H', 'I', 'J'],
        '9': ['K', 'L', 'M', 'N'],
        'x': ['O', 'P', 'Q', 'R'],
        'e': ['S', 'T', 'U', 'V']
    };

    const password = selectedPoints.map((point, index) => {
        const charIndex = index % passwordChars[point.num].length;
        const stepChar = passwordChars[point.num][charIndex];
        return `${stepChar}${point.num}`;
    }).join('');

    return password;
}

let errorMessageDisplayed = false;

// Handle selection of a point 
function handleSelection(num, position, svgContainer) {
    const pointValue = num.getAttribute('data-value');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Check if an error message is currently being displayed
    if (loginErrorMessage.textContent !== '') {
        return; // Exit the function if an error message is displayed
    }

    // Prevent consecutive selections of the same number
    if (selectedPoints.length > 0 && selectedPoints[selectedPoints.length - 1].num === pointValue) {
        displayErrorMessage("Consecutive selections of the same point are not allowed.", svgContainer);
        clearPassword();
        return;
    }

    // Limit the number of selected points to 16
    if (selectedPoints.length >= 16) {
        displayErrorMessage("Maximum of 16 points reached.", svgContainer);
        clearPassword();
        return;
    }

    if (selectedPoints.length > 0) {
        const lastPoint = selectedPoints[selectedPoints.length - 1].position;
        drawLine(svgContainer, lastPoint, position, selectedPoints.length);
    }

    selectedPoints.push({ num: pointValue, position });
    updateInfoArea();
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
    const svgContainer = document.getElementById('linesContainer');

    selectedPoints = []; // Clear the selected points array
    passwordArea.textContent = ''; // Clear the password area content

    // Remove the drawn lines
    while (svgContainer.firstChild) {
        svgContainer.removeChild(svgContainer.firstChild);
    }
}

function displayErrorMessage(message, svgContainer) {
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    loginErrorMessage.textContent = message;
    setTimeout(() => {
        loginErrorMessage.textContent = '';
        clearPassword();
    }, 2500);
}

function updateInfoArea() {
    const infoArea = document.getElementById('passwordArea');
    const passwordText = generatePassword();
    infoArea.textContent = passwordText;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const maxEmailLength = 254; // Common maximum email length

    if (email.length > maxEmailLength) {
        displayErrorMessage('Email must be 254 characters or less.', document.getElementById('linesContainer'));
        return false;
    } else if (!emailRegex.test(email)) {
        displayErrorMessage('Please enter a valid email address.', document.getElementById('linesContainer'));
        return false;
    } else if (containsMaliciousInput(email)) {
        displayErrorMessage('Email input contains potentially malicious content.', document.getElementById('linesContainer'));
        return false;
    } else {
        return true;
    }
}

function validateManualPassword(password) {
    const firebasePasswordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]+$/;
    const maxPasswordLength = 32; // Maximum password length
    const minPasswordLength = 8; // Minimum password length

    if (password.length < minPasswordLength) {
        displayErrorMessage('Password must be at least 8 characters long.', document.getElementById('linesContainer'));
        return false;
    } else if (password.length > maxPasswordLength) {
        displayErrorMessage('Password must be 32 characters or less.', document.getElementById('linesContainer'));
        return false;
    } else if (!firebasePasswordRegex.test(password)) {
        displayErrorMessage('Password can only contain letters, numbers, and the following special characters: !@#$%^&*(),.?":{}|<>', document.getElementById('linesContainer'));
        return false;
    } else if (containsMaliciousInput(password)) {
        displayErrorMessage('Password input contains potentially malicious content.', document.getElementById('linesContainer'));
        return false;
    } else {
        return true;
    }
}

function containsMaliciousInput(input) {
    // Remove leading and trailing whitespace
    input = input.trim();

    // Check for common XSS (cross-site scripting) patterns
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /onload=/gi,
        /onerror=/gi,
        /onmouseover=/gi,
        /onclick=/gi,
        /onkeydown=/gi,
        /onsubmit=/gi,
        /onchange=/gi,
        /onmouseout=/gi,
        /onkeypress=/gi,
        /onkeyup=/gi,
        /onblur=/gi,
        /onfocus=/gi,
        /onreset=/gi,
        /onselect=/gi,
        /onabort=/gi,
    ];

    for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
            return true;
        }
    }

    // Check for SQL injection patterns
    const sqlInjectionPatterns = [
        /['";]+/g,
        /\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|INTO|SELECT|UNION|UPDATE)\b/gi,
    ];

    for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(input)) {
            return true;
        }
    }

    // Check for other malicious patterns or keywords
    const maliciousPatterns = [
        /eval\(/gi,
        /document\.write/gi,
        /alert\(/gi,
        /window\./gi,
        /<[a-z]+.*?(on[a-z]+\s*=|javascript:).+?>.*?<\/[a-z]+>/gi,
    ];

    for (const pattern of maliciousPatterns) {
        if (pattern.test(input)) {
            return true;
        }
    }

    // If none of the above patterns match, consider the input safe
    return false;
}

// Function to handle user login
async function login() {
    const email = document.getElementById('userEmail').value.trim();
    const password = getPassword();
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!email || !password) {
        loginErrorMessage.textContent = "Please enter both email and password.";
        setTimeout(() => loginErrorMessage.textContent = '', 3000);
        return;
    }

    if (!validateEmail(email, loginErrorMessage) || !validateManualPassword(password, loginErrorMessage)) {
        return;
    }

    try {
        const statusMessage = await handleLogin(email, password);
        loginErrorMessage.textContent = statusMessage;
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error("Login error: ", error);
        loginErrorMessage.textContent = statusMessage ? statusMessage : "An error occurred during login. Please try again.";
    }
}

// Function to handle user account creation
async function createAccount() {
    const email = document.getElementById('userEmail').value.trim();
    const password = getPassword();
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!email || !password) {
        loginErrorMessage.textContent = "Please enter both email and password.";
        setTimeout(() => loginErrorMessage.textContent = '', 3000);
        return;
    }

    if (!validateEmail(email, loginErrorMessage) || !validateManualPassword(password, loginErrorMessage)) {
        return;
    }

    try {
        const user = await handleSignup(email, password);
        await initializeUserProfile(user);

        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Signup error: ", error);
        loginErrorMessage.textContent = "An error occurred during account creation. Please try again.";
    }
}

// Function to get the password based on the selected option
function getPassword() {
    const selectedPassword = selectedPoints.map(point => point.num).join("");
    const manualPassword = document.getElementById('manualPasswordInput').value.trim();

    if (selectedPassword && manualPassword) {
        displayErrorMessage("Please clear one of the password options.");
        clearPassword();
        return null;
    } else if (selectedPassword) {
        return generatePassword();
    } else if (manualPassword) {
        if (validateManualPassword(manualPassword, document.getElementById('loginErrorMessage'))) {
            return manualPassword;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

// Function to initialize user profile in Firestore
async function initializeUserProfile(user) {
    const pendingNameSave = localStorage.getItem('pendingNameSave');
    const displayName = pendingNameSave ? pendingNameSave : "New User";

    const userProfileData = {
        displayName: displayName,
        email: user.email
    };

    const userSettingsData = {
        learningPace: 'medium',
        contentPreferences: [],
        notificationSettings: 'never',
        languageInterface: 'english',
        audioSpeed: 'normal',
        learningPath: 'guided',
        privacySettings: 'private',
        feedbackFrequency: 'weekly'
    };
    
    try {
        saveProfile(user.uid, userProfileData);
        saveSettings(user.uid, userSettingsData);
        console.log('User profile initialized.');
    
        // Remove the pendingNameSave from localStorage after saving it to the user profile
        localStorage.removeItem('pendingNameSave');
    } catch (error) {
        console.error('Error initializing user profile:', error);
        throw error;
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('userEmail').value.trim();
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!email) {
        displayErrorMessage("Please enter your email address.");
        return;
    }

    if (!validateEmail(email, loginErrorMessage)) {
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        displaySuccessMessage("Password reset email sent. Please check your inbox.", document.getElementById('linesContainer'));
    } catch (error) {
        console.error("Error sending password reset email: ", error);
        displayErrorMessage("An error occurred while sending the password reset email. Please try again.", document.getElementById('linesContainer'));
    }
}

function displaySuccessMessage(message) {
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    loginErrorMessage.textContent = message;
    loginErrorMessage.style.color = 'green';
    setTimeout(() => {
        loginErrorMessage.textContent = '';
        loginErrorMessage.style.color = 'red';
    }, 5000);
}

// Function to check if user is signed in
function isUserSignedIn() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, error => {
            console.error("Error checking if user is signed in: ", error);
            reject(error);
        });
    });
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    positionNumbers();

    // Check if the user is already signed in
    try {
        const isSignedIn = await isUserSignedIn();
        if (isSignedIn) {
            // Redirect to the dashboard page if the user is signed in
            window.location.href = 'dashboard.html';
            return;
        }
    } catch (error) {
        console.error('Error checking user sign-in status:', error);
    }

    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('signupButton').addEventListener('click', createAccount);
    document.getElementById('clearPasswordButton').addEventListener('click', clearPassword);

    const otherOptionsButton = document.getElementById('otherOptionsButton');
    const manualPasswordContainer = document.getElementById('manualPasswordContainer');

    let manualPasswordContainerVisible = false;

    otherOptionsButton.addEventListener('click', () => {
        manualPasswordContainerVisible = !manualPasswordContainerVisible;
        manualPasswordContainer.style.display = manualPasswordContainerVisible ? 'block' : 'none';
    });

    const forgotPasswordButton = document.getElementById('forgotPasswordButton');

    forgotPasswordButton.addEventListener('click', handleForgotPassword);

    const emailInput = document.getElementById('userEmail');
    const manualPasswordInput = document.getElementById('manualPasswordInput');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    emailInput.addEventListener('input', () => {
        let validEmail = validateEmail(emailInput.value, loginErrorMessage);
    });

    manualPasswordInput.addEventListener('input', () => {
        let validPassword = validateManualPassword(manualPasswordInput.value, loginErrorMessage);
    });
});