document.addEventListener('DOMContentLoaded', function() {
    const lexiconContainer = document.getElementById('lexicon');
    const sectionSelect = document.getElementById('sectionSelect');

    function populateSectionSelect() {
        // Assuming each section in the lexicon has an ID that follows a pattern like "section1", "section2", etc.
        const sections = lexiconContainer.querySelectorAll('section');
        sections.forEach((section, index) => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = 'Section ' + (index + 1); // Customize this as needed
            sectionSelect.appendChild(option);
        });
    }

    function scrollToSection() {
        sectionSelect.addEventListener('change', function() {
            const selectedSectionId = this.value;
            const selectedSection = document.getElementById(selectedSectionId);

            if (selectedSection) {
                selectedSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    populateSectionSelect();
    scrollToSection();
});
