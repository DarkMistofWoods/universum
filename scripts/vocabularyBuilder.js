document.addEventListener("DOMContentLoaded", function() {
    const categoriesSelect = document.getElementById("categories");
    const termElement = document.getElementById("term");
    const definitionElement = document.getElementById("definition");
    const flipButton = document.getElementById("flipButton");
    const nextButton = document.getElementById("nextButton");

    let vocabulary = []; // To store fetched vocabulary
    let currentCategory = '';
    let currentTermIndex = 0;

    // Fetch and process vocabulary data
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            vocabulary = Object.entries(data).map(([key, value]) => ({
                term: key,
                ...value
            }));

            populateCategories();
            showTerm();
        });

    // Populate category selection dropdown
    function populateCategories() {
        const uniqueCategories = [...new Set(vocabulary.map(item => item.category))];
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoriesSelect.appendChild(option);
        });
    }

    // Show term based on current index and category
    function showTerm() {
        const filteredVocabulary = vocabulary.filter(item => item.category === currentCategory);
        const currentItem = filteredVocabulary[currentTermIndex];
        termElement.textContent = currentItem.term;
        definitionElement.textContent = currentItem.definition;
        definitionElement.classList.add('hidden'); // Hide definition initially
    }

    // Event listeners
    categoriesSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentTermIndex = 0; // Reset index for new category
        showTerm();
    });

    flipButton.addEventListener('click', () => {
        definitionElement.classList.toggle('hidden');
    });

    nextButton.addEventListener('click', () => {
        const filteredVocabulary = vocabulary.filter(item => item.category === currentCategory);
        if (currentTermIndex < filteredVocabulary.length - 1) {
            currentTermIndex++;
        } else {
            currentTermIndex = 0; // Loop back to the first term
        }
        showTerm();
    });
});