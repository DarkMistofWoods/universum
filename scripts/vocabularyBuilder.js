document.addEventListener("DOMContentLoaded", function() {
    const categoriesSelect = document.getElementById("categories");
    const termElement = document.getElementById("term");
    const definitionElement = document.getElementById("definition");
    const flipButton = document.getElementById("flipButton");
    const nextButton = document.getElementById("nextButton");

    let vocabulary = []; // To store fetched vocabulary
    let currentCategory = '';
    let currentTermIndex = 0;
    let currentFilteredVocabulary = []

    // Fetch and process vocabulary data
    fetch('resources/data.json')
        .then(response => response.json())
        .then(data => {
            vocabulary = Object.entries(data).map(([key, value]) => ({
                term: key,
                ...value
            }));

            populateCategories();
            currentCategory = vocabulary[0]?.category;
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
        if (currentFilteredVocabulary.length > 0) {
            const currentItem = currentFilteredVocabulary[currentTermIndex];
            termElement.textContent = currentItem.term;
            definitionElement.textContent = currentItem.definition;
            definitionElement.classList.add('hidden');
        } else {
            termElement.textContent = "No terms available for this category.";
            definitionElement.textContent = "";
            definitionElement.classList.add('hidden');
        }
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // Event listeners
    categoriesSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentTermIndex = 0; // Reset index for new category

        currentFilteredVocabulary = vocabulary.filter(item => item.category === currentCategory);
        shuffleArray(currentFilteredVocabulary); // Shuffle the filtered vocabulary

        showTerm(currentFilteredVocabulary);
    });

    flipButton.addEventListener('click', () => {
        definitionElement.classList.toggle('hidden');
    });

    nextButton.addEventListener('click', () => {
        if (currentTermIndex < currentFilteredVocabulary.length - 1) {
            currentTermIndex++;
        } else {
            currentTermIndex = 0; // Loop back to the first term
        }
        showTerm();
    });
});
