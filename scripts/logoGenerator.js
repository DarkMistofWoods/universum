// Display numbers in a circle, drawing lines between every one
function generateCircle() {
    const svgContainer = document.getElementById('linesContainer');
    const svgSize = { width: 400, height: 400 }; // Match this with your SVG's dimensions
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

    svgContainer.appendChild(line);
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', generateCircle);