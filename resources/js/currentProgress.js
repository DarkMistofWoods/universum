import { auth, onAuthStateChanged, fetchUserProgress } from './firebase-config.js';

async function initializeVisualization(user) {
    const userProgress = await fetchUserProgress(user.uid);
    const courseContent = await loadCourseContent();
    createVisualization(courseContent, userProgress);
}

async function createVisualization(courseContent, userProgress) {
    const width = 800;
    const height = 600;
    const nodeRadius = 20;
    const linkDistance = 100;

    const svg = d3.select('.container-tertiary')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(linkDistance))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

    const nodes = [];
    const links = [];

    courseContent.forEach(module => {
        const moduleNode = {
            id: module.moduleId,
            name: module.moduleName,
            type: 'module',
            progress: 0,
            proficiency: 0
        };
        nodes.push(moduleNode);

        module.subModules.forEach(subModule => {
            const subModuleNode = {
                id: subModule.subModuleId,
                name: subModule.subModuleName,
                type: 'subModule',
                progress: 0,
                proficiency: 0
            };
            nodes.push(subModuleNode);
            links.push({ source: moduleNode.id, target: subModuleNode.id });

            subModule.lessons.forEach(lesson => {
                const lessonNode = {
                    id: lesson.lessonId,
                    name: lesson.title,
                    type: 'lesson',
                    progress: userProgress[lesson.lessonId]?.completed || false,
                    proficiency: userProgress[lesson.lessonId]?.quizScores?.reduce((a, b) => a + b, 0) / (userProgress[lesson.lessonId]?.quizScores?.length || 1)
                };
                nodes.push(lessonNode);
                links.push({ source: subModuleNode.id, target: lessonNode.id });
            });
        });
    });

    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', nodeRadius)
        .attr('fill', d => {
            if (d.type === 'module') return '#3f51b5';
            if (d.type === 'subModule') return '#2196f3';
            if (d.type === 'lesson') {
                if (d.progress) return '#4caf50';
                return '#f44336';
            }
        })
        .call(drag(simulation));

    node.append('title')
        .text(d => `${d.name}\nProgress: ${d.progress ? 'Completed' : 'Not Started'}\nProficiency: ${Math.round(d.proficiency * 100)}%`);

    simulation.nodes(nodes)
    .on('tick', ticked);

    simulation.force('link')
        .links(links);

        // Add bounding box constraint
        const padding = nodeRadius * 2; // Adjust the padding as needed
        simulation.force('boundingBox', () => {
            nodes.forEach(node => {
                if (node.x < padding) {
                    node.x = padding;
                } else if (node.x > width - padding) {
                    node.x = width - padding;
                }
                if (node.y < padding) {
                    node.y = padding;
                } else if (node.y > height - padding) {
                    node.y = height - padding;
                }
            });
        });
    
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
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
    
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
                simulation.restart(); // Restart the simulation when a node is dragged
            }
    
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
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