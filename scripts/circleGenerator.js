// Display numbers in a circle, drawing lines between every one
function positionNumbers() {
    const numbers = document.querySelectorAll('.number');
    const svgContainer = document.getElementById('linesContainer');
    const radius = 150; // Circle radius
    const angleStep = (2 * Math.PI) / numbers.length;
    const startAngle = -Math.PI / 2;
    let points = [];
  
    numbers.forEach((num, index) => {
      const angle = startAngle + angleStep * index;
      const x = radius + radius * Math.cos(angle);
      const y = radius + radius * Math.sin(angle);
      points.push({x, y}); // Save points for line drawing
  
      num.style.left = `${x}px`;
      num.style.top = `${y}px`;
    });
  
    // Draw lines after positioning numbers to avoid overlap 
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

    svgContainer.appendChild(line);
}

function showInfo(numId) {
    const numberInfo = {
      'nul': '0 - nul',
      'pali': '1 - pali',
      'telo': '2 - telo',
      'basi': '3 - basi',
      'kuna': '4 - kuna',
      'muto': '5 - muto',
      'nifi': '6 - nifi',
      'sato': '7 - sato',
      'luko': '8 - luko',
      'rupo': '9 - rupo',
      'vemi': '𝒳 - vemi',
      'felo': 'ε - felo'
    };
  
    // Display the info in a designated area on the page
    const info = numberInfo[numId];
    document.getElementById('infoArea').innerText = info ? info : 'Information not found';
}

// Run the function to position numbers when the document is loaded
document.addEventListener('DOMContentLoaded', positionNumbers);