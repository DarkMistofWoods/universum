function press(value) {
    const normalizedValue = normalizeInputCharacter(value);
    document.getElementById('display').value += normalizedValue;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function normalizeInputCharacter(character) {
    if (character === '𝒳') return 'X'; // Normalize '𝒳' to 'X'
    if (character === 'ε') return 'E'; // Normalize 'ε' to 'E'
    return character;
}

// Ensure 'X' is correctly interpreted as ten in base-12 to decimal conversion
function base12ToDecimal(input) {
    // Adjusted to explicitly handle 'X' as ten
    const digits = '0123456789XE';
    return [...input.toUpperCase()].reduce((acc, curr) => {
        let digitValue = digits.indexOf(curr);
        if (digitValue === -1) {
            throw new Error(`Invalid digit: ${curr}`);
        }
        return 12 * acc + digitValue;
    }, 0);
}

// Conversion from decimal to base-12, ensuring 'X' is correctly used for ten
function decimalToBase12(num) {
    if (num === 0) return '0';
    let integerPart = Math.floor(num);
    let fractionPart = num - integerPart;
    let result = '';
    const digits = '0123456789XE';

    // Convert integer part
    while (integerPart > 0) {
        result = digits[integerPart % 12] + result;
        integerPart = Math.floor(integerPart / 12);
    }

    // Ensure the integer part is not skipped if the number is a fraction
    if (result === '' && fractionPart > 0) {
        result = '0';
    }

    // Convert fractional part
    if (fractionPart > 0) {
        result += '.'; // Decimal point in base-12
        let loopPreventer = 0; // Prevent infinite loop
        while (fractionPart !== 0 && loopPreventer < 10) { // Limit the length of fractional part
            fractionPart *= 12;
            let fractionalDigit = Math.floor(fractionPart);
            result += digits[fractionalDigit];
            fractionPart -= fractionalDigit;
            loopPreventer++;
        }
    }

    return result;
}

// Calculate base-12 expressions, correctly handling operations with 'X'
function calculate() {
    let display = document.getElementById('display');
    let input = display.value.toUpperCase(); // Ensure 'X' is uppercase for uniform handling

    try {
        let [operand1, operator, operand2] = input.split(/([+\-*/])/);
        
        // Convert operands from base-12 (including 'X') to decimal
        let num1 = base12ToDecimal(operand1);
        let num2 = base12ToDecimal(operand2);

        // Within the calculate function
        let result;
        switch (operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/':
                if (num2 === 0) {
                    display.value = 'ne kaso!';
                    return;
                }
                result = num1 / num2; // Ensure this division handles fractional results correctly.
                break;
            default: throw new Error('Invalid operation');
        }

        // Convert the result back to base-12 for display
        display.value = decimalToBase12(result);
    } catch (error) {
        display.value = error.message; // Show error message if any issues occur
    }
}


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
