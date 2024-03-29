// vocabularyBuilder.js
document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('categorySelect');
    const flashcardContent = document.getElementById('cardContent');
    const showAnswerButton = document.getElementById('showAnswer');
    const nextWordButton = document.getElementById('nextWord');
    let vocabularyData = {};
    let currentCardIndex = 0;
    let currentCategory = 'numbers'; // Default category
    let showAnswer = false;

    // Fetch vocabulary data from data.json
    fetch('resources/data.json')
        .then(response => response.json())
        .then(data => {
            vocabularyData = categorizeVocabulary(data);
            updateCategoryOptions();
            displayFlashcard();
        })
        .catch(error => console.error('Failed to load vocabulary data:', error));

    // Organize vocabulary by categories
    function categorizeVocabulary(data) {
        const categories = {};
        Object.keys(data).forEach(term => {
            const item = data[term];
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push({ term, ...item });
        });
        return categories;
    }

    // Update category options based on fetched data
    function updateCategoryOptions() {
        categorySelect.innerHTML = Object.keys(vocabularyData)
            .map(category => `<option value="${category}">${category}</option>`)
            .join('');
    }

    // Event listeners for interactive elements
    showAnswerButton.addEventListener('click', () => {
        showAnswer = !showAnswer;
        displayFlashcard();
    });

    nextWordButton.addEventListener('click', () => {
        currentCardIndex = (currentCardIndex + 1) % vocabularyData[currentCategory].length;
        showAnswer = false; // Reset to show term first for the next card
        displayFlashcard();
    });

    categorySelect.addEventListener('change', (event) => {
        currentCategory = event.target.value;
        currentCardIndex = 0; // Reset index for new category
        displayFlashcard();
    });

    // Display the current flashcard
    function displayFlashcard() {
        if (vocabularyData[currentCategory] && vocabularyData[currentCategory][currentCardIndex]) {
            const cardData = vocabularyData[currentCategory][currentCardIndex];
            flashcardContent.textContent = showAnswer ? `${cardData.term}: ${cardData.definition}` : cardData.term;
        }
    }
});
