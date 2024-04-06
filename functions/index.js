/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.initializeUserProgressOnSignUp = functions.auth.user().onCreate(async (user) => {
    // Default for user's progress in each lesson
    const defaultProgress = {
        vocabulary: {
            Vocabulary_1: {
                "Lesson 1: Common Phrases": {
                    completed: true, // completion is determined by having an average quiz score of 60% or above (server) should not revert to false if it's already true
                    quizScores: [] // Five most recent scores
                },
                "Lesson 2: Numbers and Counting": {
                    completed: false,
                    quizScores: [] // Scores have not been added because user has not completed any quizzes 
                },
                "Lesson 3: Colors and Shapes": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Time and Days": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Vocabulary_2: {
                "Lesson 1: Family and People": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Food and Drink": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Clothing and Body": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Home and Daily Routines": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Vocabulary_3: {
                "Lesson 1: Nature and Weather": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: City and Transportation": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Shopping and Money": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Health and Emergency": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Vocabulary_4: {
                "Lesson 1: Emotions and Opinions": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Hobbies and Leisure": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Education and Work": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Travel and Culture": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Vocabulary_5: {
                "Lesson 1: Complex Descriptions": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Abstract Concepts": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Formal and Informal Language": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Compound Word Construction": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Vocabulary_6: {
                "Lesson 1: Science and Technology": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Arts and Literature": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Business and Economy": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Politics and Society": {
                    completed: false,
                    quizScores: [] 
                },
            }
        },
        grammar: {
            Grammar_1: {
                "Lesson 1: Sentence Structure": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Pronouns and Simple Verbs": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Present, Past, and Future Tenses": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Yes/No Questions and Answers": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Grammar_2: {
                "Lesson 1: Negation": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Plurals and Quantity": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Descriptive Language": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Prepositions and Directions": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Grammar_3: {
                "Lesson 1: Possessive Structures": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Comparatives and Superlatives": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Imperatives and Commands": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Question Words": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Grammar_4: {
                "Lesson 1: Conjunctions and Complex Sentences": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Conditional Sentences": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Expressing Opinions and Emotions": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Indirect Speech and Reported Questions": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Grammar_5: {
                "Lesson 1: Nuances of Politeness": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Cultural Expressions and Idioms": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Error Correction and Clarification": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Style and Register": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Grammar_6: {
                "Lesson 1: Debating and Persuasion": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Storytelling and Narration": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Academic and Formal Writing": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Humor and Playfulness in Language": {
                    completed: false,
                    quizScores: [] 
                },
            }
        },
        comprehension: {
            Comprehension_1: {
                "Lesson 1: Understanding Basic Greetings and Introductions": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Numbers and Time": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Common Phrases and Responses": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Simple Instructions and Commands": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Comprehension_2: {
                "Lesson 1: Shopping Conversations": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Restaurant and Food": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Directions and Transportation": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Weather and Seasons": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Comprehension_3: {
                "Lesson 1: Educational Content": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Work and Occupation Dialogues": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Health and Wellness": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Entertainment and Media": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Comprehension_4: {
                "Lesson 1: Narratives and Storytelling": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Opinions and Arguments": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Cultural and Historical Texts": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Technical and Scientific Articles": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Comprehension_5: {
                "Lesson 1: Abstract and Philosophical Texts": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Poetry and Literature": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: News and Current Events": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Formal and Academic Papers": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Comprehension_6: {
                "Lesson 1: Interactive Scenarios and Role Plays": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Listening and Audio Comprehension": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Visual Comprehension and Interpretation": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Comprehension Through Creation": {
                    completed: false,
                    quizScores: [] 
                },
            }
        },
        math: {
            Math_1: {
                "Lesson 1: Introduction to Base-12 System": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Counting in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Basic Operations in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Multiplication and Division in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Math_2: {
                "Lesson 1: Carrying and Borrowing in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Advanced Multiplication and Division": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Fractions in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Converting Between Base-10 and Base-12": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Math_3: {
                "Lesson 1: Base-12 Place Values": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Using Base-12 in Practical Situations": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Decimals in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Ratios and Proportions in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Math_4: {
                "Lesson 1: Geometric Shapes and Measurements in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Algebraic Expressions in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Graphing in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Statistics and Probability in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
            },
            Math_5: {
                "Lesson 1: Mathematical Puzzles in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 2: Exploring Patterns and Sequences in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 3: Base-12 in Science and Technology": {
                    completed: false,
                    quizScores: [] 
                },
                "Lesson 4: Theoretical Math in Base-12": {
                    completed: false,
                    quizScores: [] 
                },
            }
        },
        // Include other modules and submodules as necessary
    };

  return admin.firestore().collection('userProgress').doc(user.uid).set(defaultProgress);
});

exports.updateUserProgress = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
  
    const userId = context.auth.uid;
    const { module, submodule, lesson, newScore } = data; // Now accepting submodule and newScore
  
    // Construct the document reference for the user's progress
    const userProgressRef = admin.firestore().collection('userProgress').doc(userId);
  
    try {
      // Retrieve current lesson data
      const doc = await userProgressRef.get();
      let userProgress = doc.data();
      let lessonData = userProgress[module][submodule][lesson];

      // Initialize quizScores array if it doesn't exist
      if (!lessonData.quizScores) {
        lessonData.quizScores = [];
      }

      // Add the new score and ensure only the five most recent scores are kept
      lessonData.quizScores.push(newScore);
      while (lessonData.quizScores.length > 5) {
          lessonData.quizScores.shift(); // Remove the oldest score
      }

      // Calculate the average score and update completion status
      const averageScore = lessonData.quizScores.reduce((acc, score) => acc + score, 0) / lessonData.quizScores.length;
      lessonData.completed = averageScore > 60; // Assuming completion requires an average score > 60%

      // Update Firestore
      await userProgressRef.update({
        [`${module}.${submodule}.${lesson}`]: lessonData // Update the specific lesson with new data
      });

      return { success: true, message: "Progress and quiz scores updated successfully." };
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw new functions.https.HttpsError('unknown', 'Failed to update progress');
    }
});
  