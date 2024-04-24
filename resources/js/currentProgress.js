import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

async function createVisualization(courseContent, userProgress) {
    const width = 800;
    const height = 600;
    const starRadius = 5;
    const starSpacing = 50;
    const pathColor = '#ccc';
    const completedColor = '#fff';
    const incompleteColor = '#888';

    const svg = d3.select('.container-tertiary')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const modules = courseContent.map(module => ({
        ...module,
        subModules: module.subModules.map(subModule => ({
            ...subModule,
            lessons: subModule.lessons.map(lesson => ({
                ...lesson,
                completed: userProgress[lesson.lessonId]?.completed || false,
            })),
        })),
    }));

    const stars = modules.reduce((acc, module) => [
        ...acc,
        ...module.subModules.reduce((acc, subModule) => [
            ...acc,
            ...subModule.lessons.map(lesson => ({
                ...lesson,
                module: module.moduleName,
                subModule: subModule.subModuleName,
            })),
        ], []),
    ], []);

    const simulation = d3.forceSimulation(stars)
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(starSpacing))
        .on('tick', ticked);

    const link = svg.append('g')
        .attr('stroke', pathColor)
        .attr('stroke-width', 1.5)
        .selectAll('line')
        .data(stars.slice(1))
        .join('line')
        .attr('stroke', d => d.completed ? completedColor : pathColor);

    const node = svg.append('g')
        .selectAll('circle')
        .data(stars)
        .join('circle')
        .attr('r', starRadius)
        .attr('fill', d => d.completed ? completedColor : incompleteColor)
        .on('mouseover', (event, d) => {
            d3.select('.center-text')
                .text(`${d.title} (${d.module} - ${d.subModule})`)
                .style('fill', d.completed ? completedColor : incompleteColor);
        })
        .on('mouseout', () => {
            d3.select('.center-text')
                .text('Current Progress')
                .style('fill', 'currentColor');
        })
        .call(drag(simulation));

    function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    }

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
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