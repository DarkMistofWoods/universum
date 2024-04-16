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
    lexiconContent.innerHTML = ''; // Clear previous content
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
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${term}:</strong> ${definition}`;
                listItem.setAttribute('data-term', term.toLowerCase());
                listItem.setAttribute('data-definition', definition.toLowerCase());
                termList.appendChild(listItem);
            });
            
            classElement.appendChild(termList);
            categoryElement.appendChild(classElement);
        }
        
        lexiconContent.appendChild(categoryElement);
    }
}

function setupSearch(data) {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const listItems = document.querySelectorAll('#lexiconContent li');
        
        listItems.forEach(item => {
            const term = item.getAttribute('data-term');
            const definition = item.getAttribute('data-definition');
            
            if (term.includes(searchTerm) || definition.includes(searchTerm)) {
                item.style.display = 'list-item';
            } else {
                item.style.display = 'none';
            }
        });
    });
}