function login() { // doubles as a 'sign up' function
    const email = document.getElementById('userEmail').value;
    if (selectedPoints.length < 8 | selectedPoints.length > 16) {
        // If the password is shorter than 8 characters, show a message
        updateInfoArea("Your password must be 8-16 characters long.");
        return false; // Prevent the submission or finalization
    }
    const password = selectedPoints.map(point => point.num).join("-");
    
    // Attempt to sign in
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Sign in success
            document.getElementById('authMessage').textContent = 'Sign in successful!';
            window.location.href = 'dashboard.html'; // Redirect to dashboard or other page
        })
        .catch((error) => {
            // If sign-in fails because the user doesn't exist, try signing up
            if (error.code === 'auth/user-not-found') {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Sign up success
                        document.getElementById('authMessage').textContent = 'Account created and sign in successful!';
                        window.location.href = 'dashboard.html'; // Redirect to dashboard or other page
                    })
                    .catch((signUpError) => {
                        // Handle other errors, including sign up failures
                        document.getElementById('authMessage').textContent = `Error: ${signUpError.message}`;
                    });
            } else {
                // Handle other sign-in errors
                document.getElementById('authMessage').textContent = `Error: ${error.message}`;
            }
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
    const colors = ["red", "green", "blue", "orange", "purple", "cyan", "magenta", "lime", "pink", "grey", "gold", "brown"];
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
document.addEventListener('DOMContentLoaded', positionNumbers);