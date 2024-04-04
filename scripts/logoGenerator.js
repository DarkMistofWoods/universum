// Display numbers in a circle, drawing lines between every one
function generateCircle() {
    const svgContainer = document.getElementById('lineCircleContainer');
    lineDelay = 0; // Reset delay each time the circle is generated
    const svgSize = { width: 100, height: 100 }; // Match this with your SVG's dimensions
    const radius = 50; // Circle radius
    const numberOfPoints = 12; // Number of points on the circle
    const center = { x: svgSize.width / 2, y: svgSize.height / 2 }; // Center of the SVG
    const angleStep = (2 * Math.PI) / numberOfPoints;
  
    let points = [];
  
    for (let index = 0; index < numberOfPoints; index++) {
        const angle = angleStep * index;
        const x = center.x + radius * Math.cos(angle); // Adjust position to be centered in the SVG
        const y = center.y + radius * Math.sin(angle); // Adjust position to be centered in the SVG
        points.push({x, y}); // Save points for line drawing
    }
  
    // Draw lines between points
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            drawLine(svgContainer, points[i], points[j]);
        }
    }

    const circleContainer = document.querySelector('.circle-logo-container');
    circleContainer.addEventListener('click', () => {
        circleContainer.classList.add('circle-logo-glow'); // Apply glow effect
        window.location.href = '/index.html'; // URL to navigate to
    });

    // When adding glow on hover or click, make sure transitions are considered
    circleContainer.addEventListener('mouseover', () => {
        document.querySelectorAll('#lineCircleContainer line').forEach(line => {
            line.style.strokeOpacity = "1"; // Apply glow effect smoothly
            line.style.stroke = "#95BFB8"; // Change to glow color smoothly
        });
        circleContainer.style.filter = "drop-shadow(0 0 8px #95BFB8)"; // Apply glow effect smoothly
    });

    circleContainer.addEventListener('mouseleave', () => {
        // Initiate fade for all lines
        document.querySelectorAll('#lineCircleContainer line').forEach(line => {
            line.style.strokeOpacity = "1"; // Assuming the non-glow state has stroke-opacity at 0
            line.style.stroke = "#5F736F"; // Change back to original stroke color
        });
        circleContainer.style.filter = "none"; // Remove any filter applied for the glow
    });
}
  
function drawLine(svgContainer, point1, point2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", point1.x);
    line.setAttribute("y1", point1.y);
    line.setAttribute("x2", point2.x);
    line.setAttribute("y2", point2.y);
    line.setAttribute("stroke", "#5F736F"); // Set line color

    // Set line thickness here
    line.setAttribute("stroke-width", "0.5"); // Makes the line thinner
    line.style.animationDelay = `${lineDelay}s`;
    lineDelay += 0.1; // Adjust delay between lines as needed

    svgContainer.appendChild(line);
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', generateCircle);