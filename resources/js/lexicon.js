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

    const lexiconGrid = document.createElement('div');
    lexiconGrid.classList.add('lexicon-grid');

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

        lexiconGrid.appendChild(categorySection);
    }
    
    lexiconContent.appendChild(lexiconGrid);
}

function setupSearch(data) {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const listItems = document.querySelectorAll('#lexiconContent li');
        const classHeadings = document.querySelectorAll('#lexiconContent h4');
        const categorySections = document.querySelectorAll('#lexiconContent .category-section');
        
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
            const listItems = heading.nextElementSibling.querySelectorAll('li');
            const visibleItems = Array.from(listItems).filter(item => item.style.display !== 'none');
            
            if (visibleItems.length === 0) {
                heading.style.display = 'none';
            } else {
                heading.style.display = 'block';
            }
        });
        
        categorySections.forEach(section => {
            const classHeadings = section.querySelectorAll('h4');
            const visibleClassHeadings = Array.from(classHeadings).filter(heading => heading.style.display !== 'none');
            
            if (visibleClassHeadings.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
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