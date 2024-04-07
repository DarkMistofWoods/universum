import { getFunctions, httpsCallable } from '../firebase/functions';
import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, continue with page-specific logic
        // await renderContent(user);
    } else {
        // User is not signed in, redirect to login
        window.location.href = 'login.html';
    }
});

const functions = getFunctions();
const updateUserProgress = httpsCallable(functions, 'updateUserProgress');

// Function that calls updateUserProgress
async function updateLesson(moduleKey, submoduleKey, lessonKey, newScore) {
  try {
      let lesson = userProgress[moduleKey][submoduleKey][lessonKey];

      // Initialize quizScores array if it doesn't exist
      if (!lesson.quizScores) {
          lesson.quizScores = [];
      }

      // Add the new score and ensure only the five most recent scores are kept
      if (newScore !== undefined) {
          lesson.quizScores.push(newScore);
          while (lesson.quizScores.length > 5) {
              lesson.quizScores.shift(); // Remove the oldest score if more than five are stored
          }
      }

      // Calculate the average score, ensuring we avoid division by zero
      const averageScore = lesson.quizScores.length > 0 
      ? lesson.quizScores.reduce((acc, score) => acc + score, 0) / lesson.quizScores.length
      : 0;

      // Update the completed status based on the average score
      lesson.completed = averageScore > 60;
      
      const result = await updateUserProgress({ module: moduleKey, lesson: lessonKey, completed: lesson.completed });
      console.log(result.data); // Success response

      // Note: The actual updating to a backend or Firebase should consider the structure change
      // and possibly use a different approach or additional data handling
  } catch (error) {
      console.error("Error in completeLesson:", error); // Handle errors
  }
}

// To call updateUserProgress from completeLesson:
// completeLesson('vocabulary', 'Lesson 1: Common Phrases');

// Example call to update progress directly (instantiate every time)
/*
updateUserProgress({
  module: "vocabulary",
  lesson: "Lesson 1: Common Phrases",
  completed: true
})
.then((result) => {
  console.log(result.data); // Handle the response
})
.catch((error) => {
  console.error("Error updating progress:", error); // Handle any errors
});
*/