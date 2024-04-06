import { getFunctions, httpsCallable } from 'firebase/functions';
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
async function completeLesson(moduleName, lessonName) {
    try {
      // Use await to wait for the promise from updateUserProgress to resolve
      const completed = true; // Assuming the lesson is now completed
      const result = await updateUserProgress({ module: moduleName, lesson: lessonName, completed });
      
      console.log(result.data); // Success response
      // Handle any additional logic after updating progress successfully
    } catch (error) {
      console.error("Error updating progress:", error); // Handle errors
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