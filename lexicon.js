// Function to add a term to the lexicon
function addTerm(termName, definition) {
    const termContainer = document.getElementById("termsContainer");
    const newTerm = document.createElement("div");
    newTerm.classList.add("term");
    newTerm.innerHTML = `<h2>${termName}</h2><p>${definition}</p>`;
    termContainer.appendChild(newTerm);

    // Sort terms alphabetically
    Array.from(termContainer.children)
        .sort((a, b) => a.querySelector("h2").textContent.localeCompare(b.querySelector("h2").textContent))
        .forEach(term => termContainer.appendChild(term));
}

// Function to search for terms
function search() {
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();
    const terms = document.querySelectorAll(".term");
    terms.forEach(term => {
        const definition = term.querySelector("p").textContent.toLowerCase();
        if (definition.includes(searchTerm)) {
            term.style.display = "block";
        } else {
            term.style.display = "none";
        }
    });
}

// Fetching terms and definitions from a text file
fetch('./resources/terms.txt')
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n');
        lines.forEach(line => {
            const [termName, definition] = line.split('|');
            addTerm(termName.trim(), definition.trim());
        });
    })
    .catch(error => console.error('Error fetching terms:', error));
