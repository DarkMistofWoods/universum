function press(value) {
    const display = document.getElementById('display');
    display.value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculate() {
    let input = document.getElementById('display').value;
    // Convert base-12 input to decimal
    input = input.replace(/A/g, '10').replace(/B/g, '11');
    let result = eval(input);
    // Convert the result back to base-12
    result = result.toString(12).toUpperCase().replace(/A/g, 'vemi').replace(/B/g, 'felo');
    document.getElementById('display').value = result;
}