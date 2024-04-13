import { db, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Display numbers in a circle, drawing lines between every one
let selectedPoints = []; // Store the sequence of selected points

const demoProgressData = {
    progressData: { progressData },
    achievementsData: [
        { name: 'Complete 10 lessons', progress: 0 },
        { name: 'Learn 20 words', progress: 0 },
        { name: 'Score 100% on three separate quizzes', progress: 0 }
    ],
    recommendationsData: {
        recommendation1: {
            title: 'Recommendation 1',
            description: 'Description 1',
            link: '#'
        },
        recommendation2: {
            title: 'Recommendation 2',
            description: 'Description 2',
            link: '#'
        }
    },
    goalsData: [
        {
            title: 'Goal 1',
            progress: 0,
            target: 10
        },
        {
            title: 'Goal 2',
            progress: 0,
            target: 20
        }
    ]
};

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

// Handle selection of a point 
function handleSelection(num, position, svgContainer) {
    // Extract the point's value from the data-value attribute
    const pointValue = num.getAttribute('data-value');

    // Prevent consecutive selections of the same number
    if (selectedPoints.length > 0 && selectedPoints[selectedPoints.length - 1].num === pointValue) {
        updateInfoArea("Consecutive selections of the same point are not allowed.");
        setTimeout(() => clearPassword(), 3000); // Clear the message after 3 seconds
        return; // Exit the function if the current point is the same as the last one
    }

    // Limit the number of selected points to 16
    if (selectedPoints.length >= 16) {
        updateInfoArea("Maximum of 16 points reached.");
        setTimeout(() => clearPassword(), 3000); // Clear the message after 3 seconds
        return;
    }

    if (selectedPoints.length > 0) {
        const lastPoint = selectedPoints[selectedPoints.length - 1].position;
        drawLine(svgContainer, lastPoint, position, selectedPoints.length); // Pass length for color differentiation
    }

    selectedPoints.push({ num: pointValue, position }); // Store the data-value attribute instead of the element itself
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
    const svgContainer = document.getElementById('linesContainer');

    passwordArea.textContent = ""; // Clear the displayed password pattern
    selectedPoints = []; // Clear the current password sequence

    // remove the drawn lines
    while (svgContainer.firstChild) {
        svgContainer.removeChild(svgContainer.firstChild);
    }
}

function updateInfoArea(message = "") {
    const infoArea = document.getElementById('passwordArea');
    const passwordText = generatePassword();
    if (message) {
        // If a message is provided, display it directly
        infoArea.textContent = message;
        infoArea.classList.add('expanded'); // Add the 'expanded' class to show the message
    } else {
        // If no message is provided, proceed to display the password pattern
        infoArea.textContent = passwordText;
        infoArea.classList.remove('expanded'); // Remove the 'expanded' class
    }
}

function validateEmail(email, errorMessage) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const maxEmailLength = 254; // Common maximum email length

    if (email.length > maxEmailLength) {
        errorMessage.textContent = 'Email must be 254 characters or less.';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else if (containsMaliciousInput(email)) {
        errorMessage.textContent = 'Email input contains potentially malicious content.';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else {
        errorMessage.textContent = '';
        return true;
    }
}

function validateManualPassword(password, errorMessage) {
    const firebasePasswordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]+$/;
    const maxPasswordLength = 32; // Maximum password length

    if (password.length > maxPasswordLength) {
        errorMessage.textContent = 'Password must be 32 characters or less.';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else if (!firebasePasswordRegex.test(password)) {
        errorMessage.textContent = 'Password can only contain letters, numbers, and the following special characters: !@#$%^&*(),.?":{}|<>';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else if (containsMaliciousInput(password)) {
        errorMessage.textContent = 'Password input contains potentially malicious content.';
        setTimeout(() => errorMessage.textContent = '', 3000); // Clear the message after 3 seconds
        return false;
    } else {
        errorMessage.textContent = '';
        return true;
    }
}

function containsMaliciousInput(input) {
    // Add your logic to detect and prevent malicious input
    // For example, you can use a library like DOMPurify to sanitize the input
    // return DOMPurify.sanitize(input) !== input;
    return false; // Placeholder implementation
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

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Login error: ", error);
        loginErrorMessage.textContent = error.message;
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

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await initializeUserProfile(user);

        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Signup error: ", error);
        loginErrorMessage.textContent = error.message;
    }
}

// Function to get the password based on the selected option
function getPassword() {
    const selectedPassword = selectedPoints.map(point => point.num).join("");
    const manualPassword = document.getElementById('manualPasswordInput').value.trim();

    if (selectedPassword && manualPassword) {
        updateInfoArea("Please clear one of the password options.");
        setTimeout(() => clearPassword(), 3000);
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
    const userProfileData = {
        displayName: "New User",
        email: user.email,
        settings: {
            learningPace: 'medium',
            contentPreferences: [],
            notificationSettings: 'never',
            languageInterface: 'english',
            audioSpeed: 'normal',
            dailyGoals: '',
            learningPath: 'guided',
            privacySettings: 'private',
            feedbackFrequency: 'weekly'
        }
    };
    
    await setDoc(doc(db, 'userProfiles', user.uid), userProfileData);
    console.log('User profile initialized.');
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    positionNumbers();

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

    forgotPasswordButton.addEventListener('click', () => {
        // TODO: Implement forgot password functionality
        console.log('Forgot password button clicked');
    });

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