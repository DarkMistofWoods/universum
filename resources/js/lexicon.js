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

    const lexiconList = document.createElement('div');
    lexiconList.classList.add('lexicon-list');

    // Generate HTML for each category and class
    for (const category in categories) {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category-section');

        const categoryHeading = document.createElement('h3');
        categoryHeading.textContent = category;
        categorySection.appendChild(categoryHeading);
        
        for (const termClass in categories[category]) {
            const classSection = document.createElement('div');
            classSection.classList.add('class-section');

            const classHeading = document.createElement('h4');
            classHeading.textContent = termClass;
            classSection.appendChild(classHeading);
            
            const termList = document.createElement('ul');
            categories[category][termClass].forEach(({ term, definition }) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${term}:</strong> ${definition}`;
                listItem.setAttribute('data-term', term.toLowerCase());
                listItem.setAttribute('data-definition', definition.toLowerCase());
                termList.appendChild(listItem);
            });
            
            classSection.appendChild(termList);
            categorySection.appendChild(classSection);
        }

        lexiconList.appendChild(categorySection);
    }
    
    lexiconContent.appendChild(lexiconList);
}

function setupSearch(data) {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const listItems = document.querySelectorAll('.lexicon-list li');
        const classHeadings = document.querySelectorAll('.lexicon-list h4');
        const categoryHeadings = document.querySelectorAll('.lexicon-list h3');
        
        listItems.forEach(item => {
            const term = item.getAttribute('data-term');
            const definition = item.getAttribute('data-definition');
            
            if (term.includes(searchTerm) || definition.includes(searchTerm)) {
                item.style.display = 'list-item';
            } else {
                item.style.display = 'none';
            }
        });
        
        classHeadings.forEach(heading => {
            const nextElement = heading.nextElementSibling;
            if (nextElement && nextElement.tagName === 'UL' && !nextElement.querySelector('li:not([style*="display: none"])')) {
                heading.style.display = 'none';
            } else {
                heading.style.display = 'block';
            }
        });
        
        categoryHeadings.forEach(heading => {
            const nextElements = getNextSiblings(heading);
            if (nextElements.every(element => element.tagName === 'H4' && element.style.display === 'none')) {
                heading.style.display = 'none';
            } else {
                heading.style.display = 'block';
            }
        });
    });
}

function getNextSiblings(element) {
    const siblings = [];
    let sibling = element.nextElementSibling;
    
    while (sibling && (sibling.tagName === 'H4' || sibling.tagName === 'UL')) {
        siblings.push(sibling);
        sibling = sibling.nextElementSibling;
    }
    
    return siblings;
}