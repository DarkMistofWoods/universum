import { auth } from './firebase-config.js';

const navigationPoints = [
    { pageName: "Settings", url: "./settings.html" },
    { pageName: "Achievements", url: "./achievements.html" },
    { pageName: "Base-12 Math", url: "./base-12-math.html" },
    { pageName: "Grammar", url: "./grammar.html" },
    { pageName: "Phonology", url: "./phonology.html" },
    { pageName: "Lexicon", url: "./lexicon.html" },
    { pageName: "Challenges", url: "./challenges.html" },
    { pageName: "Community", url: "./community.html" },
    { pageName: "Knowledge Center", url: "./knowledge-center.html" },
    { pageName: "Dashboard", url: "./dashboard.html" },
    { pageName: "Current Progress", url: "./current-progress.html" },
    { pageName: "Community Progress", url: "./community-progress.html" }
];

const numberOfPoints = 12;
const radius = 45;
const centerX = 50;
const centerY = 50;

function calculatePosition(angle, radius) {
    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
    };
}

const svgContainer = document.querySelector('.nav-circle');
let positions = [];
for(let i = 0; i < numberOfPoints; i++) {
    let angle = (i / numberOfPoints) * (2 * Math.PI);
    positions.push(calculatePosition(angle, radius));
}

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

function createPoint(angle, radius, pageName, url, index, svgContainer) {
    let position = positions[index];
    let point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("class", "nav-point");
    point.setAttribute("cx", position.x);
    point.setAttribute("cy", position.y);
    point.setAttribute("r", 3.5);
    point.setAttribute("data-page-name", pageName);
    point.setAttribute("data-url", url);
    point.setAttribute("data-index", index);

    let hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hitArea.setAttribute("cx", position.x);
    hitArea.setAttribute("cy", position.y);
    hitArea.setAttribute("r", 9);
    hitArea.setAttribute("class", "nav-point-hit-area");
    hitArea.setAttribute("fill", "transparent");

    let isTappedOnce = false;

    hitArea.addEventListener('mouseenter', () => {
        document.querySelector('.center-text').textContent = pageName;
        document.querySelector('.center-text').style.opacity = 1;
        point.setAttribute("r", 5);
        highlightConnectedLines(index, 'highlight-lines');
    });

    hitArea.addEventListener('mouseleave', () => {
        if (!isTappedOnce) {
            document.querySelector('.center-text').style.opacity = 0;
            point.setAttribute("r", 3.5);
            highlightConnectedLines(index, 'highlight-lines', false);
        }
    });

    let tapTimeout;

    hitArea.addEventListener('click', async (e) => {
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            e.preventDefault();
            if (isTappedOnce) {
                clearTimeout(tapTimeout);
                const isSignedIn = await isUserSignedIn();
                if (isSignedIn || !['Settings', 'Achievements', 'Challenges', 'Community', 'Knowledge Center', 'Dashboard', 'Current Progress', 'Community Progress'].includes(pageName)) {
                    window.location.href = url;
                } else {
                    window.location.href = 'login.html';
                }
            } else {
                document.querySelector('.center-text').textContent = pageName;
                document.querySelector('.center-text').style.opacity = 1;
                highlightConnectedLines(index, 'highlight-lines');
                isTappedOnce = true;
                tapTimeout = setTimeout(() => {
                    isTappedOnce = false;
                    document.querySelector('.center-text').style.opacity = 0;
                    point.setAttribute("r", 3.5);
                    highlightConnectedLines(index, 'highlight-lines', false);
                }, 3000);
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

function drawLines(svgContainer, positions, className) {
    const drawnLines = new Set();

    for (let startIndex = 0; startIndex < positions.length; startIndex++) {
        for (let endIndex = startIndex + 1; endIndex < positions.length; endIndex++) {
            const startPos = positions[startIndex];
            const endPos = positions[endIndex];
            const lineKey = `${Math.min(startIndex, endIndex)}-${Math.max(startIndex, endIndex)}`;

            if (!drawnLines.has(lineKey)) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startPos.x);
                line.setAttribute("y1", startPos.y);
                line.setAttribute("x2", endPos.x);
                line.setAttribute("y2", endPos.y);
                line.setAttribute("class", `nav-line ${className}`);
                line.setAttribute("data-start-index", startIndex);
                line.setAttribute("data-end-index", endIndex);
                svgContainer.appendChild(line);
                drawnLines.add(lineKey);
            }
        }
    }
}

drawLines(svgContainer, positions, 'background-lines');
drawLines(svgContainer, positions, 'highlight-lines');

navigationPoints.forEach((navPoint, index) => {
    if (index < positions.length) {
        let position = positions[index];
        if (position) {
            let hitArea = createPoint(position.angle, radius, navPoint.pageName, navPoint.url, index, svgContainer);
            svgContainer.appendChild(hitArea);
        } else {
            console.warn(`No position defined for index: ${index}`);
        }
    } else {
        console.warn(`Index out of bounds: ${index}, Positions Length: ${positions.length}`);
    }
});

const circleContainer = document.querySelector('.circle-container');
const navCircle = document.querySelector('.nav-circle');

circleContainer.addEventListener('click', (e) => {
    const navCircleRect = navCircle.getBoundingClientRect();
    const centerRadius = 90;
    const clickX = e.clientX - navCircleRect.left;
    const clickY = e.clientY - navCircleRect.top;
    const distance = Math.sqrt(Math.pow(clickX - navCircleRect.width / 2, 2) + Math.pow(clickY - navCircleRect.height / 2, 2));

    if (distance <= centerRadius) {
        window.location.href = './index.html';
    }
});

const centerText = document.querySelector('.center-text');

navCircle.addEventListener('mouseenter', (e) => {
    const navCircleRect = navCircle.getBoundingClientRect();
    const centerRadius = 90;
    const mouseX = e.clientX - navCircleRect.left;
    const mouseY = e.clientY - navCircleRect.top;
    const distance = Math.sqrt(Math.pow(mouseX - navCircleRect.width / 2, 2) + Math.pow(mouseY - navCircleRect.height / 2, 2));

    if (distance <= centerRadius) {
        navCircle.style.cursor = 'pointer';
        centerText.classList.add('center-area-hover');
        highlightAllLines();
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

function highlightAllLines() {
    const lines = document.querySelectorAll('.highlight-lines');
    lines.forEach(line => {
        line.classList.add('highlighted');
    });
}

function highlightConnectedLines(index, className, highlight = true) {
    document.querySelectorAll(`.${className}`).forEach(line => {
        const startIndex = parseInt(line.getAttribute('data-start-index'));
        const endIndex = parseInt(line.getAttribute('data-end-index'));

        if (startIndex === index || endIndex === index) {
            if (highlight) {
                line.classList.add('highlighted');
            } else {
                line.classList.remove('highlighted');
            }
        }
    });
}

function resetLineHighlights() {
    const lines = document.querySelectorAll('.highlight-lines');
    lines.forEach(line => {
        line.classList.remove('highlighted');
    });
}