const exercises = [
    {
        question: "Translate to Universum: 'I eat apple.'",
        answer: "ya benu apel."
    },
    {
        question: "What is the correct word order for 'You see stone'?",
        options: ["ye bato tuki", "ye tuki bato", "tuki bato ye"],
        answer: "ye tuki bato"
    },
    {
        question: "How do you form a yes/no question in Universum?",
        options: [
            "Add 'ne' before the verb",
            "Add 'Fa' at the beginning of the sentence",
            "Place the verb at the end of the sentence",
            "Reverse the order of the subject and verb"
        ],
        answer: "Add 'Fa' at the beginning of the sentence"
    },
    {
        question: "Translate to Universum: 'Do you eat apple?'",
        answer: "fa ye benu apele?"
    },
    {
        question: "Which particle indicates the future tense in Universum?",
        options: [
            "ta",
            "te",
            "to",
            "ne"
        ],
        answer: "to"
    },
    {
        question: "Translate to Universum: 'I will see the big tree.'",
        answer: "ya to tuki puno fali."
    },
    {
        question: "How is plurality indicated in Universum?",
        options: [
            "By repeating the noun",
            "By adding 'ka' after the noun",
            "By adding 'ne' before the noun",
            "No indication; context only"
        ],
        answer: "By adding 'ka' after the noun"
    },
    {
        question: "Translate to Universum: 'They did not find the stone.'",
        answer: "yaya ta ne loko bato."
    },
    {
        question: "How is possession shown in Universum?",
        options: [
            "By using the particle 'ba'",
            "By using possessive pronouns",
            "By placing the possessor after the possessed",
            "By reversing the order of the possessor and possessed"
        ],
        answer: "By using possessive pronouns"
    },
    {
        question: "Translate to Universum: 'Our new house is big.'",
        answer: "yosa vune batofali puno."
    },
    {
        question: "Which option correctly forms a comparative in Universum?",
        options: [
            "Adding 'mo' before the adjective",
            "Adding 'ka' after the adjective",
            "Repeating the adjective",
            "Using 'ma' after the adjective"
        ],
        answer: "Adding 'mo' before the adjective"
    },
    {
        question: "Translate to Universum: 'Where are you going?'",
        answer: "fa ye pika?"
    }
    // Add more exercises as needed
];
let currentExerciseIndex = 0;

function loadExercise() {
    const exercise = exercises[currentExerciseIndex];
    document.getElementById("question").textContent = exercise.question;
    
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = ''; // Clear previous options

    if (exercise.options) {
        // Create radio buttons for multiple choice
        exercise.options.forEach((option, index) => {
            const label = document.createElement("label");
            label.classList.add("option-label"); // Add class for styling if needed

            const radioButton = document.createElement("input");
            radioButton.type = "radio";
            radioButton.name = "options";
            radioButton.value = option;

            label.appendChild(radioButton);
            label.appendChild(document.createTextNode(option));

            optionsContainer.appendChild(label);
        });
    } else {
        // For open-ended questions, use a text input
        const input = document.createElement("input");
        input.type = "text";
        input.id = "userInput";
        optionsContainer.appendChild(input);
    }
}

function submitAnswer() {
    const exercise = exercises[currentExerciseIndex];
    let userAnswer;

    if (exercise.options) {
        // For multiple-choice, find which radio button is checked
        const selectedOption = document.querySelector('input[name="options"]:checked');
        userAnswer = selectedOption ? selectedOption.value : "";
    } else {
        // For open-ended questions
        userAnswer = document.getElementById("userInput").value;
    }

    // Provide feedback
    const feedbackElement = document.getElementById("feedback");
    if (userAnswer.toLowerCase() === exercise.answer.toLowerCase()) {
        feedbackElement.textContent = "Correct!";
    } else {
        feedbackElement.textContent = `Incorrect. The correct answer is: ${exercise.answer}`;
    }
}

function loadNextExercise() {
    currentExerciseIndex++;
    if (currentExerciseIndex >= exercises.length) {
        shuffleArray(exercises)
        currentExerciseIndex = 0; // Restart from the beginning or display a completion message
        alert("You've completed all exercises!");
    }
    loadExercise(); // Load the new exercise
    document.getElementById("feedback").textContent = ''; // Clear feedback
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

document.addEventListener("DOMContentLoaded", function(){
    shuffleArray(exercises); // remove if questions increase in difficulty
    loadExercise();
});
