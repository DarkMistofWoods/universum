document.addEventListener('DOMContentLoaded', function() {
    const exerciseContainer = document.getElementById('exerciseContainer');
    const nextExerciseButton = document.getElementById('nextExercise');

    let currentExerciseIndex = 0;
    let exercises = [];

    // Function to load exercises from the JSON file
    function loadExercises() {
        fetch('./data.json')
            .then(response => response.json())
            .then(data => {
                exercises = formatExercises(data);
                displayExercise();
            })
            .catch(error => console.error('Failed to load data:', error));
    }

    // Format raw data into exercises (simplified example)
    function formatExercises(data) {
        // This function should transform the data into a structure suitable for grammar exercises
        // For simplicity, this example assumes exercises are pre-formatted
        return Object.keys(data).map(key => ({
            term: key,
            definition: data[key].definition,
            example: `Example usage of ${key}`, // Placeholder for actual exercise content
        }));
    }

    // Display the current exercise
    function displayExercise() {
        if (exercises[currentExerciseIndex]) {
            const exercise = exercises[currentExerciseIndex];
            exerciseContainer.innerHTML = `
                <div>
                    <h3>${exercise.term}</h3>
                    <p>${exercise.definition}</p>
                    <p>${exercise.example}</p>
                    <!-- Add interactive components here -->
                </div>
            `;
        }
    }

    nextExerciseButton.addEventListener('click', () => {
        currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
        displayExercise();
    });

    loadExercises();
});