import { auth } from './firebase-config.js';

const navigationPoints = [
    { pageName: "Settings", url: "./settings.html" },
    { pageName: "Achievements", url: "./achievements.html" },
    { pageName: "Base-12 Math", url: "./base-12-math.hmtl" },
    { pageName: "Grammar", url: "./grammar.html" },
    { pageName: "Phonology", url: "./phonology.html" },
    { pageName: "Lexicon", url: "./lexicon.html" },
    { pageName: "Challenges", url: "./challenges.html" },
    { pageName: "Community", url: "./community.html" },
    { pageName: "Knowledge Center", url: "./knowledge-center.html" },
    { pageName: "Dashboard", url: "./dashboard.html" },
    { pageName: "Current Progress", url: "./current-progress.html" },
    { pageName: "Community Progress", url: "./community-progress.html" }
    // 12 total pages
];

// Define the number of points and the radius of the navigation circle
const numberOfPoints = 12;
const radius = 45; // Adjust based on your SVG viewBox size

// Center position of the circle within the SVG
const centerX = 50;
const centerY = 50;

// Function to calculate point positions
function calculatePosition(angle, radius) {
    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
    };
}

// Generate and place points on the circle
const svgContainer = document.querySelector('.nav-circle');
// Store calculated positions
let positions = [];
// Generate positions for all points first
for(let i = 0; i < numberOfPoints + 1; i++) {
    let angle = (i / numberOfPoints) * (2 * Math.PI); // Angle in radians
    positions.push(calculatePosition(angle, radius));
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
        });
    });
}

// Function to create a point with event listeners
function createPoint(angle, radius, pageName, url, index, svgContainer) {
    let position = positions[index];
    let point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("class", "nav-point");
    point.setAttribute("cx", position.x);
    point.setAttribute("cy", position.y);
    point.setAttribute("r", 3.5);
    point.setAttribute("data-page-name", pageName);
    point.setAttribute("data-url", url); // Store the URL in data attribute
    point.setAttribute("data-index", index); // Store the index of the point
    let isTappedOnce = false; // State to track if the point was tapped once

    // Create an invisible, larger hit area for the point
    let hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hitArea.setAttribute("cx", position.x);
    hitArea.setAttribute("cy", position.y);
    hitArea.setAttribute("r", 9); // Larger radius for easier interaction
    hitArea.setAttribute("class", "nav-point-hit-area");
    hitArea.setAttribute("fill", "transparent"); // Make it invisible

    hitArea.addEventListener('mouseenter', () => {
        document.querySelector('.center-text').textContent = pageName;
        document.querySelector('.center-text').style.opacity = 1;
        point.setAttribute("r", 5); // Making the point larger on hover
        // Highlight connected lines
        document.querySelectorAll('.nav-line').forEach(line => {
            if (line.getAttribute('data-start-index') == index || line.getAttribute('data-end-index') == index) {
                line.classList.add('highlighted');
            }
        });
    });

    hitArea.addEventListener('mouseleave', () => {
        // Only revert hover effects if on desktop or if not tapped
        if (!isTappedOnce) {
            document.querySelector('.center-text').style.opacity = 0;
            point.setAttribute("r", 3.5); // Revert point size
            // Revert lines to default state
            document.querySelectorAll('.nav-line.highlighted').forEach(line => {
                line.classList.remove('highlighted');
            });
        }
    });

    hitArea.addEventListener('click', async (e) => {
        if ('ontouchstart' in window || navigator.maxTouchPoints) { // Check for touch capability
            e.preventDefault(); // Prevent default to allow for the tap logic
            if (isTappedOnce) {
                const isSignedIn = await isUserSignedIn();
                if (isSignedIn || !['Settings', 'Achievements', 'Challenges', 'Community', 'Knowledge Center', 'Dashboard', 'Current Progress', 'Community Progress'].includes(pageName)) {
                    window.location.href = url;
                } else {
                    window.location.href = 'login.html';
                }
            } else {
                // First tap
                document.querySelector('.center-text').textContent = pageName;
                document.querySelector('.center-text').style.opacity = 1;
                point.setAttribute("r", 5); // Making the point larger on tap
                // Highlight connected lines
                document.querySelectorAll('.nav-line').forEach(line => {
                    if (line.getAttribute('data-start-index') == index || line.getAttribute('data-end-index') == index) {
                        line.classList.add('highlighted');
                    }
                });
                isTappedOnce = true;
                setTimeout(() => {
                    isTappedOnce = false;
                    if ('ontouchstart' in window || navigator.maxTouchPoints) {
                        document.querySelector('.center-text').style.opacity = 0;
                        point.setAttribute("r", 3.5); // Revert point size
                        // Revert lines to default state
                        document.querySelectorAll('.nav-line.highlighted').forEach(line => {
                            line.classList.remove('highlighted');
                        });
                    }
                }, 2500); // Adjust timeout as needed
            }
        } else {
            const isSignedIn = await isUserSignedIn();
            if (isSignedIn || !['Settings', 'Achievements', 'Challenges', 'Community', 'Knowledge Center', 'Dashboard', 'Current Progress', 'Community Progress'].includes(pageName)) {
                window.location.href = url;
            } else {
                window.location.href = 'login.html';
            }
        }
    });

    // Desktop hover effects
    point.addEventListener('mouseenter', () => {
        document.querySelector('.center-text').textContent = pageName;
        document.querySelector('.center-text').style.opacity = 1;
        // Highlight connected lines
        document.querySelectorAll('.nav-line').forEach(line => {
            if (line.getAttribute('data-start-index') == index || line.getAttribute('data-end-index') == index) {
                line.classList.add('highlighted');
            }
        });
    });
    
    point.addEventListener('mouseleave', () => {
        // Only revert hover effects if on desktop or if not tapped
        if (!isTappedOnce) {
            document.querySelector('.center-text').style.opacity = 0;
            // Revert lines to default state
            document.querySelectorAll('.nav-line.highlighted').forEach(line => {
                line.classList.remove('highlighted');
            });
        }
    });

    // Handling click/tap
    point.addEventListener('click', async (e) => {
        if ('ontouchstart' in window || navigator.maxTouchPoints) { // Check for touch capability
            e.preventDefault(); // Prevent default to allow for the tap logic
            if (isTappedOnce) {
                const isSignedIn = await isUserSignedIn();
                if (isSignedIn || !['Settings', 'Achievements', 'Challenges', 'Community', 'Knowledge Center', 'Dashboard', 'Current Progress', 'Community Progress'].includes(pageName)) {
                    window.location.href = url;
                } else {
                    window.location.href = 'login.html';
                }
            } else {
                // First tap
                document.querySelector('.center-text').textContent = pageName;
                document.querySelector('.center-text').style.opacity = 1;
                // Highlight connected lines
                document.querySelectorAll('.nav-line').forEach(line => {
                    if (line.getAttribute('data-start-index') == index || line.getAttribute('data-end-index') == index) {
                        line.classList.add('highlighted');
                    }
                });
                isTappedOnce = true;
                setTimeout(() => {
                    isTappedOnce = false;
                    if ('ontouchstart' in window || navigator.maxTouchPoints) {
                        document.querySelector('.center-text').style.opacity = 0;
                        // Revert lines to default state
                        document.querySelectorAll('.nav-line.highlighted').forEach(line => {
                            line.classList.remove('highlighted');
                        });
                    }
                }, 2500); // Adjust timeout as needed
            }
        } else {
            const isSignedIn = await isUserSignedIn();
            if (isSignedIn || !['Settings', 'Achievements', 'Challenges', 'Community', 'Knowledge Center', 'Dashboard', 'Current Progress', 'Community Progress'].includes(pageName)) {
                window.location.href = url;
            } else {
                window.location.href = 'login.html';
            }
        }
    });

    svgContainer.appendChild(point);
    return hitArea;
}

// Function to draw lines between points
function drawLines(svgContainer, positions) {
    positions.forEach((startPos, startIndex) => {
        positions.forEach((endPos, endIndex) => {
            if(startIndex !== endIndex) {
                let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startPos.x);
                line.setAttribute("y1", startPos.y);
                line.setAttribute("x2", endPos.x);
                line.setAttribute("y2", endPos.y);
                line.setAttribute("class", "nav-line");
                // Store the indexes of the connected points
                line.setAttribute("data-start-index", startIndex);
                line.setAttribute("data-end-index", endIndex);
                svgContainer.appendChild(line);
            }
        });
    });
}

// Draw lines before points to ensure lines are under points
drawLines(svgContainer, positions);

navigationPoints.forEach((navPoint, index) => {
    if (index < positions.length) { // This check is good practice
        let position = positions[index]; // Safely access 'positions'
        if (position) { // Additional safety check
            let hitArea = createPoint(position.angle, radius, navPoint.pageName, navPoint.url, index, svgContainer);
            svgContainer.appendChild(hitArea);
        } else {
            console.warn(`No position defined for index: ${index}`);
        }
    } else {
        console.warn(`Index out of bounds: ${index}, Positions Length: ${positions.length}`);
    }
});

// Add event listener for click on the center of the navigation circle
const circleContainer = document.querySelector('.circle-container');
const navCircle = document.querySelector('.nav-circle');

circleContainer.addEventListener('click', (e) => {
    // Get the bounding rectangle of the navigation circle
    const navCircleRect = navCircle.getBoundingClientRect();

    // Check if the click occurred within the center area (adjust the radius as needed)
    const centerRadius = 180; // Adjust this value to control the size of the center area
    const clickX = e.clientX - navCircleRect.left;
    const clickY = e.clientY - navCircleRect.top;
    const distance = Math.sqrt(Math.pow(clickX - navCircleRect.width / 2, 2) + Math.pow(clickY - navCircleRect.height / 2, 2));

    if (distance <= centerRadius) {
        // Navigate to the home page
        window.location.href = './index.html';
    }
});

// Add event listener for hover on the center of the navigation circle
const centerText = document.querySelector('.center-text');

navCircle.addEventListener('mouseenter', (e) => {
    const navCircleRect = navCircle.getBoundingClientRect();
    const centerRadius = 180;
    const mouseX = e.clientX - navCircleRect.left;
    const mouseY = e.clientY - navCircleRect.top;
    const distance = Math.sqrt(Math.pow(mouseX - navCircleRect.width / 2, 2) + Math.pow(mouseY - navCircleRect.height / 2, 2));

    if (distance <= centerRadius) {
        navCircle.style.cursor = 'pointer';
        centerText.classList.add('center-area-hover');
        highlightIntersectingLines();
    } else {
        navCircle.style.cursor = 'default';
        centerText.classList.remove('center-area-hover');
        resetLineHighlights();
    }
});

navCircle.addEventListener('mouseleave', () => {
    navCircle.style.cursor = 'default';
    centerText.classList.remove('center-area-hover');
    resetLineHighlights();
});

function highlightIntersectingLines() {
    const lines = document.querySelectorAll('.nav-line');
    lines.forEach(line => {
        const x1 = parseFloat(line.getAttribute('x1'));
        const y1 = parseFloat(line.getAttribute('y1'));
        const x2 = parseFloat(line.getAttribute('x2'));
        const y2 = parseFloat(line.getAttribute('y2'));

        if ((x1 === centerX && y1 === centerY) || (x2 === centerX && y2 === centerY)) {
            line.classList.add('highlighted');
        }
    });
}

function resetLineHighlights() {
    const lines = document.querySelectorAll('.nav-line');
    lines.forEach(line => {
        line.classList.remove('highlighted');
    });
}