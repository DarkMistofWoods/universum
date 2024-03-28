function displayTerms(filter = '') {
    const filteredData = lexiconData.filter(item => {
        const firstWordOfDefinition = item.definition.split(' ')[0].toLowerCase();
        return item.term.toLowerCase().includes(filter.toLowerCase()) || firstWordOfDefinition.includes(filter.toLowerCase());
    });

    const categories = [...new Set(filteredData.map(item => item.category))].sort();

    const lexiconContainer = document.getElementById('lexicon');
    lexiconContainer.innerHTML = ''; // Clear existing content

    categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category-section');
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categorySection.appendChild(categoryTitle);

        // Group terms by class within the current category
        const classGroups = filteredData.filter(item => item.category === category).reduce((acc, item) => {
            acc[item.class] = [...(acc[item.class] || []), item];
            return acc;
        }, {});

        Object.entries(classGroups).sort().forEach(([className, items]) => {
            const classSection = document.createElement('section');
            classSection.classList.add('class-section');
            const classTitle = document.createElement('h3');
            classTitle.textContent = className;
            classSection.appendChild(classTitle);

            items.sort((a, b) => a.term.localeCompare(b.term)).forEach(item => {
                const termElement = document.createElement('p');
                termElement.innerHTML = `<strong>${item.term}</strong>: ${item.definition}`;
                classSection.appendChild(termElement);
            });

            categorySection.appendChild(classSection);
        });

        lexiconContainer.appendChild(categorySection);
    });
}
