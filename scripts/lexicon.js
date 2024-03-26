document.addEventListener('DOMContentLoaded', function() {
    let lexiconData = [];

    function displayTerms(filter = '') {
        const filteredData = lexiconData.filter(item => item.definition?.toLowerCase().includes(filter.toLowerCase()));

        const categories = [...new Set(filteredData.map(item => item.category))].sort();

        const lexiconContainer = document.getElementById('lexicon');
        lexiconContainer.innerHTML = ''; // Clear existing content
        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.classList.add('category-section');
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category;
            categorySection.appendChild(categoryTitle);

            const termsList = filteredData.filter(item => item.category === category).sort((a, b) => a.term.localeCompare(b.term));
            termsList.forEach(item => {
                const termElement = document.createElement('p');
                termElement.innerHTML = `<strong>${item.term}</strong>: ${item.definition}`;
                categorySection.appendChild(termElement);
            });

            lexiconContainer.appendChild(categorySection);
        });
    }

    fetch('universim/resources/terms.txt')
        .then(response => response.text())
        .then(text => {
            lexiconData = text.split('\n').map(line => {
                const parts = line.split('|');
                if (parts.length !== 3) {
                    console.error('Malformed line:', line);
                }
                return { term: parts[0], definition: parts[1], category: parts[2] };
            });

            displayTerms(); // Display all terms initially

            // Set up search functionality
            const searchBox = document.getElementById('searchBox');
            searchBox.addEventListener('input', () => {
                const searchTerm = searchBox.value;
                displayTerms(searchTerm);
            });
        })
        .catch(error => console.error('Error loading the lexicon:', error));
});
