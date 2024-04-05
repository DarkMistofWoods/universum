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
    // Default progress structure
    const defaultProgress = {
        vocabulary: {
            Vocabulary_1: {
                "Lesson 1: Common Phrases": false, // true indicates completion
                "Lesson 2: Numbers and Counting": false,
                "Lesson 3: Colors and Shapes": false,
                "Lesson 4: Time and Days": false,
            },
            Vocabulary_2: {
                "Lesson 1: Family and People": false,
                "Lesson 2: Food and Drink": false,
                "Lesson 3: Clothing and Body": false,
                "Lesson 4: Home and Daily Routines": false,
            },
            Vocabulary_3: {
                "Lesson 1: Nature and Weather": false,
                "Lesson 2: City and Transportation": false,
                "Lesson 3: Shopping and Money": false,
                "Lesson 4: Health and Emergency": false,
            },
            Vocabulary_4: {
                "Lesson 1: Emotions and Opinions": false,
                "Lesson 2: Hobbies and Leisure": false,
                "Lesson 3: Education and Work": false,
                "Lesson 4: Travel and Culture": false,
            },
            Vocabulary_5: {
                "Lesson 1: Complex Descriptions": false,
                "Lesson 2: Abstract Concepts": false,
                "Lesson 3: Formal and Informal Language": false,
                "Lesson 4: Compound Word Construction": false,
            },
            Vocabulary_6: {
                "Lesson 1: Science and Technology": false,
                "Lesson 2: Arts and Literature": false,
                "Lesson 3: Business and Economy": false,
                "Lesson 4: Politics and Society": false,
            }
        },
        grammar: {
            Grammar_1: {
                "Lesson 1: Sentence Structure": false,
                "Lesson 2: Pronouns and Simple Verbs": false,
                "Lesson 3: Present, Past, and Future Tenses": false,
                "Lesson 4: Yes/No Questions and Answers": false
            },
            Grammar_2: {
                "Lesson 1: Negation": false,
                "Lesson 2: Plurals and Quantity": false,
                "Lesson 3: Descriptive Language": false,
                "Lesson 4: Prepositions and Directions": false
            },
            Grammar_3: {
                "Lesson 1: Possessive Structures": false,
                "Lesson 2: Comparatives and Superlatives": false,
                "Lesson 3: Imperatives and Commands": false,
                "Lesson 4: Question Words": false
            },
            Grammar_4: {
                "Lesson 1: Conjunctions and Complex Sentences": false,
                "Lesson 2: Conditional Sentences": false,
                "Lesson 3: Expressing Opinions and Emotions": false,
                "Lesson 4: Indirect Speech and Reported Questions": false
            },
            Grammar_5: {
                "Lesson 1: Nuances of Politeness": false,
                "Lesson 2: Cultural Expressions and Idioms": false,
                "Lesson 3: Error Correction and Clarification": false,
                "Lesson 4: Style and Register": false
            },
            Grammar_6: {
                "Lesson 1: Debating and Persuasion": false,
                "Lesson 2: Storytelling and Narration": false,
                "Lesson 3: Academic and Formal Writing": false,
                "Lesson 4: Humor and Playfulness in Language": false
            }
        },
        comprehension: {
            Comprehension_1: {
                "Lesson 1: Understanding Basic Greetings and Introductions": false,
                "Lesson 2: Numbers and Time": false,
                "Lesson 3: Common Phrases and Responses": false,
                "Lesson 4: Simple Instructions and Commands": false
            },
            Comprehension_2: {
                "Lesson 1: Shopping Conversations": false,
                "Lesson 2: Restaurant and Food": false,
                "Lesson 3: Directions and Transportation": false,
                "Lesson 4: Weather and Seasons": false
            },
            Comprehension_3: {
                "Lesson 1: Educational Content": false,
                "Lesson 2: Work and Occupation Dialogues": false,
                "Lesson 3: Health and Wellness": false,
                "Lesson 4: Entertainment and Media": false
            },
            Comprehension_4: {
                "Lesson 1: Narratives and Storytelling": false,
                "Lesson 2: Opinions and Arguments": false,
                "Lesson 3: Cultural and Historical Texts": false,
                "Lesson 4: Technical and Scientific Articles": false
            },
            Comprehension_5: {
                "Lesson 1: Abstract and Philosophical Texts": false,
                "Lesson 2: Poetry and Literature": false,
                "Lesson 3: News and Current Events": false,
                "Lesson 4: Formal and Academic Papers": false
            },
            Comprehension_6: {
                "Lesson 1: Interactive Scenarios and Role Plays": false,
                "Lesson 2: Listening and Audio Comprehension": false,
                "Lesson 3: Visual Comprehension and Interpretation": false,
                "Lesson 4: Comprehension Through Creation": false
            }
        },
        math: {
            Math_1: {
                "Lesson 1: Introduction to Base-12 System": false,
                "Lesson 2: Counting in Base-12": false,
                "Lesson 3: Basic Operations in Base-12": false,
                "Lesson 4: Multiplication and Division in Base-12": false
            },
            Math_2: {
                "Lesson 1: Carrying and Borrowing in Base-12": false,
                "Lesson 2: Advanced Multiplication and Division": false,
                "Lesson 3: Fractions in Base-12": false,
                "Lesson 4: Converting Between Base-10 and Base-12": false
            },
            Math_3: {
                "Lesson 1: Base-12 Place Values": false,
                "Lesson 2: Using Base-12 in Practical Situations": false,
                "Lesson 3: Decimals in Base-12": false,
                "Lesson 4: Ratios and Proportions in Base-12": false
            },
            Math_4: {
                "Lesson 1: Geometric Shapes and Measurements in Base-12": false,
                "Lesson 2: Algebraic Expressions in Base-12": false,
                "Lesson 3: Graphing in Base-12": false,
                "Lesson 4: Statistics and Probability in Base-12": false
            },
            Math_5: {
                "Lesson 1: Mathematical Puzzles in Base-12": false,
                "Lesson 2: Exploring Patterns and Sequences in Base-12": false,
                "Lesson 3: Base-12 in Science and Technology": false,
                "Lesson 4: Theoretical Math in Base-12": false
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
    const { module, lesson, completed } = data;
  
    // Construct the field path for the specific lesson's completion status
    const fieldPath = `${module}.${lesson}.completed`;
  
    try {
      await admin.firestore().collection('userProgress').doc(userId).update({
        [fieldPath]: completed
      });
      return { success: true, message: "Progress updated successfully." };
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw new functions.https.HttpsError('unknown', 'Failed to update progress');
    }
});
  