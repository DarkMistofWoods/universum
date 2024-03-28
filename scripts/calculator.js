function press(value) {
    const display = document.getElementById('display');
    display.value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculate() {
    let input = document.getElementById('display').value;
    // Convert base-12 input (with 'X' and 'ε') to decimal
  input = input.replace(/𝒳/g, '10').replace(/ε/g, '11');
  let result = eval(input);
  // Convert the result back to base-12 using 'X' for ten and 'ε' for eleven
  result = result.toString(12).toUpperCase().replace(/A/g, '𝒳').replace(/B/g, 'ε');
  document.getElementById('display').value = result;
}
