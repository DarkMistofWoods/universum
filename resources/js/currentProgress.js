import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

async function createVisualization(courseContent, userProgress) {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select('.container-tertiary')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const moduleGroups = svg.selectAll('.module')
        .data(courseContent)
        .enter()
        .append('g')
        .attr('class', 'module')
        .attr('transform', (d, i) => `translate(${centerX + Math.cos(i * 2 * Math.PI / courseContent.length) * 200}, ${centerY + Math.sin(i * 2 * Math.PI / courseContent.length) * 200})`);

    moduleGroups.append('text')
        .attr('class', 'module-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .text(d => d.moduleName);

    const subModuleGroups = moduleGroups.selectAll('.submodule')
        .data(d => d.subModules)
        .enter()
        .append('g')
        .attr('class', 'submodule')
        .attr('transform', (d, i, nodes) => {
            const parentTransform = d3.select(nodes[i].parentNode).attr('transform');
            const [x, y] = parentTransform.substring(parentTransform.indexOf('(') + 1, parentTransform.indexOf(')')).split(',');
            const angle = i * 2 * Math.PI / nodes.length;
            const radius = 100;
            return `translate(${parseFloat(x) + Math.cos(angle) * radius}, ${parseFloat(y) + Math.sin(angle) * radius})`;
        });

    const lessonGroups = subModuleGroups.selectAll('.lesson')
        .data(d => d.lessons)
        .enter()
        .append('g')
        .attr('class', 'lesson')
        .attr('transform', (d, i, nodes) => {
            const parentTransform = d3.select(nodes[i].parentNode).attr('transform');
            const [x, y] = parentTransform.substring(parentTransform.indexOf('(') + 1, parentTransform.indexOf(')')).split(',');
            const angle = i * 2 * Math.PI / nodes.length;
            const radius = 50;
            return `translate(${parseFloat(x) + Math.cos(angle) * radius}, ${parseFloat(y) + Math.sin(angle) * radius})`;
        });

    lessonGroups.append('image')
        .attr('xlink:href', './resources/icons/Universum-Sun-Icon.svg')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', -10)
        .attr('y', -10)
        .attr('class', d => `lesson-star ${userProgress[d.lessonId]?.completed ? 'completed' : ''}`);

    lessonGroups.append('text')
        .attr('class', 'lesson-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '2em')
        .text(d => d.title)
        .attr('visibility', 'hidden');

    lessonGroups.on('mouseover', function () {
        d3.select(this).select('.lesson-label').attr('visibility', 'visible');
    }).on('mouseout', function () {
        d3.select(this).select('.lesson-label').attr('visibility', 'hidden');
    });

    const paths = svg.selectAll('path')
        .data(courseContent)
        .enter()
        .append('path')
        .attr('class', 'constellation-path')
        .attr('d', (d, i) => {
            const source = d3.select(moduleGroups.nodes()[i]).attr('transform');
            const [x1, y1] = source.substring(source.indexOf('(') + 1, source.indexOf(')')).split(',');
            const x2 = centerX;
            const y2 = centerY;
            return `M${x1},${y1}L${x2},${y2}`;
        })
        .attr('stroke', 'rgba(255, 255, 255, 0.2)')
        .attr('fill', 'none');
}

async function loadCourseContent() {
    const response = await fetch('functions/courseContent.json');
    return await response.json();
}

// Function to check the authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            initializeVisualization(user);
        } else {
            // User is signed out
            console.log('User is signed out');
            // Redirect to login page or show login prompt
            window.location.href = '/login.html';
        }
    });
}

// Call the main function when the page loads
window.addEventListener('DOMContentLoaded', checkAuthState);