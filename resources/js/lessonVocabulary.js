// Import necessary functions and data
import { renderLessonLayout } from './lessonCore.js';

// Function to load the vocabulary data from data.json
async function loadVocabularyData() {
    try {
      const response = await fetch('resources/data.json');
      const vocabularyData = await response.json();
      return vocabularyData;
    } catch (error) {
      console.error('Error loading vocabulary data:', error);
      return null;
    }
}

// Function to generate lesson content based on the current lesson
async function generateLessonContent(currentLesson) {
  const vocabularyData = await loadVocabularyData();
  const lessonTerms = getVocabularyTerms(currentLesson);
  const introductionContent = generateIntroductionContent(lessonTerms);
  const flashcardsContent = generateFlashcardsContent(lessonTerms);
  const matchingGameContent = generateMatchingGameContent(lessonTerms);
  const quizQuestions = generateQuizQuestions(lessonTerms);

  return {
    introduction: introductionContent,
    flashcards: flashcardsContent,
    matchingGame: matchingGameContent,
    quiz: quizQuestions,
  };
}

// Function to extract relevant vocabulary terms based on the current lesson
function getVocabularyTerms(currentLesson) {
  const [module, subModule, lessonNumber] = currentLesson.split('_');
  const lessonIndex = parseInt(lessonNumber.split('-')[1], 10) - 1;

  const vocabularyTerms = Object.entries(vocabularyData)
    .filter(([_, term]) => term.category === 'Functional Words' && term.class === 'Interjection')
    .map(([word, term]) => ({ word, ...term }));

  return vocabularyTerms;
}

// Function to generate the introduction content with the list of terms and definitions
function generateIntroductionContent(lessonTerms) {
  const introductionContent = `
    <h2>Introduction</h2>
    <p>In this lesson, we will learn the following vocabulary terms:</p>
    <ul>
      ${lessonTerms
        .map(term => `<li><strong>${term.word}</strong>: ${term.definition}</li>`)
        .join('')}
    </ul>
  `;

  return introductionContent;
}

// Function to generate the flashcards content
function generateFlashcardsContent(lessonTerms) {
  const flashcardsContent = `
    <h2>Flashcards</h2>
    <div class="flashcards-container">
      ${lessonTerms
        .map(term => `
          <div class="flashcard">
            <div class="flashcard-term">${term.word}</div>
            <div class="flashcard-definition">${term.definition}</div>
            <button class="flashcard-pronunciation">Pronunciation</button>
          </div>
        `)
        .join('')}
    </div>
  `;

  return flashcardsContent;
}

// Function to generate the matching game content
function generateMatchingGameContent(lessonTerms) {
  const matchingGameContent = `
    <h2>Matching Game</h2>
    <div class="matching-game-container">
      <div class="matching-game-terms">
        ${lessonTerms.map(term => `<div class="matching-game-term">${term.word}</div>`).join('')}
      </div>
      <div class="matching-game-definitions">
        ${lessonTerms.map(term => `<div class="matching-game-definition">${term.definition}</div>`).join('')}
      </div>
    </div>
  `;

  return matchingGameContent;
}

// Function to generate quiz questions
function generateQuizQuestions(lessonTerms) {
  const quizQuestions = [
    ...lessonTerms.map(term => ({
      question: `What is the meaning of "${term.word}"?`,
      options: getRandomOptions(lessonTerms, term, 'definition'),
      answer: term.definition,
    })),
    ...lessonTerms.map(term => ({
      question: `Which word means "${term.definition}"?`,
      options: getRandomOptions(lessonTerms, term, 'word'),
      answer: term.word,
    })),
  ];

  return quizQuestions;
}

// Function to get random options for quiz questions
function getRandomOptions(lessonTerms, currentTerm, field) {
  const options = lessonTerms
    .filter(term => term.word !== currentTerm.word)
    .map(term => term[field])
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  options.push(currentTerm[field]);
  options.sort(() => Math.random() - 0.5);

  return options;
}

// Function to render the lesson
async function renderLesson(currentModule, currentLesson) {
    try {
      // Dynamically import the lesson-specific script based on the current module
      const lessonScript = await import(`./${currentModule}.js`);
  
      // Check if the lesson-specific script has a renderLesson function
      if (typeof lessonScript.renderLesson === 'function') {
        // Call the renderLesson function from the lesson-specific script
        lessonScript.renderLesson(currentLesson);
      } else {
        // Handle the case when the lesson-specific script doesn't have a renderLesson function
        console.error(`The lesson script for module "${currentModule}" does not have a renderLesson function.`);
        // Display an error message or fallback content
      }
    } catch (error) {
      // Handle the case when the lesson-specific script is not available
      console.error(`Error loading the lesson script for module "${currentModule}":`, error);
      // Display an error message or fallback content
    }
}

// Export the renderLesson function
export { renderLesson };