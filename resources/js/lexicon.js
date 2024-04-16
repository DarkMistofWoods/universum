document.addEventListener('DOMContentLoaded', function() {
    fetch('resources/data.json')
        .then(response => response.json())
        .then(data => {
            displayLexicon(data);
            setupSearch(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});

function displayLexicon(data) {
    const lexiconContent = document.getElementById('lexiconContent');
    const categories = {};

    // Group terms by category and class
    for (const term in data) {
        const { definition, class: termClass, category } = data[term];
        
        if (!categories[category]) {
            categories[category] = {};
        }
        
        if (!categories[category][termClass]) {
            categories[category][termClass] = [];
        }
        
        categories[category][termClass].push({ term, definition });
    }

    // Generate HTML for each category and class
    for (const category in categories) {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('lexicon-category');
        categoryElement.innerHTML = `<h3>${category}</h3>`;
        
        for (const termClass in categories[category]) {
            const classElement = document.createElement('div');
            classElement.classList.add('lexicon-class');
            classElement.innerHTML = `<h4>${termClass}</h4>`;
            
            const termList = document.createElement('ul');
            categories[category][termClass].forEach(({ term, definition }) => {
                termList.innerHTML += `<li><strong>${term}:</strong> ${definition}</li>`;
            });
            
            classElement.appendChild(termList);
            categoryElement.appendChild(classElement);
        }
        
        lexiconContent.appendChild(categoryElement);
    }
}

function setupSearch(data) {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const searchResults = {};
        
        for (const term in data) {
            const { definition, class: termClass, category } = data[term];
            
            if (term.toLowerCase().includes(searchTerm) || definition.toLowerCase().includes(searchTerm)) {
                if (!searchResults[category]) {
                    searchResults[category] = {};
                }
                
                if (!searchResults[category][termClass]) {
                    searchResults[category][termClass] = [];
                }
                
                searchResults[category][termClass].push({ term, definition });
            }
        }
        
        const lexiconContent = document.getElementById('lexiconContent');
        lexiconContent.innerHTML = '';
        displayLexicon(searchResults);
    });
}