import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

const courseContent = [
    {
        moduleName: "Vocabulary",
        moduleId: "vocabularyModule",
        subModules: [
            {
                subModuleName: "Introduction to Universum Vocabulary",
                subModuleId: "Vocabulary_1",
                lessons: [
                    { title: "Lesson 1: Common Phrases", pageUrl: "../knowledge/vocabulary/level1/lesson-1.html" },
                    { title: "Lesson 2: Numbers and Counting", pageUrl: "../knowledge/vocabulary/level1/lesson-2.html" },
                    { title: "Lesson 3: Colors and Shapes", pageUrl: "../knowledge/vocabulary/level1/lesson-3.html" },
                    { title: "Lesson 4: Time and Days", pageUrl: "../knowledge/vocabulary/level1/lesson-4.html" }
                ]
            },
            {
                subModuleName: "Everyday Vocabulary",
                subModuleId: "Vocabulary_2",
                lessons: [
                    { title: "Lesson 1: Family and People", pageUrl: "../knowledge/vocabulary/level2/lesson-1.html" },
                    { title: "Lesson 2: Food and Drink", pageUrl: "../knowledge/vocabulary/level2/lesson-2.html" },
                    { title: "Lesson 3: Clothing and Body", pageUrl: "../knowledge/vocabulary/level2/lesson-3.html" },
                    { title: "Lesson 4: Home and Daily Routines", pageUrl: "../knowledge/vocabulary/level2/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Describing the World",
                subModuleId: "Vocabulary_3",
                lessons: [
                    { title: "Lesson 1: Nature and Weather", pageUrl: "../knowledge/vocabulary/level3/lesson-1.html" },
                    { title: "Lesson 2: City and Transportation", pageUrl: "../knowledge/vocabulary/level3/lesson-2.html" },
                    { title: "Lesson 3: Shopping and Money", pageUrl: "../knowledge/vocabulary/level3/lesson-3.html" },
                    { title: "Lesson 4: Health and Emergency", pageUrl: "../knowledge/vocabulary/level3/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Expressing Ideas and Feelings",
                subModuleId: "Vocabulary_4",
                lessons: [
                    { title: "Lesson 1: Emotions and Opinions", pageUrl: "../knowledge/vocabulary/level4/lesson-1.html" },
                    { title: "Lesson 2: Hobbies and Leisure", pageUrl: "../knowledge/vocabulary/level4/lesson-2.html" },
                    { title: "Lesson 3: Education and Work", pageUrl: "../knowledge/vocabulary/level4/lesson-3.html" },
                    { title: "Lesson 4: Travel and Culture", pageUrl: "../knowledge/vocabulary/level4/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Advanced Communication",
                subModuleId: "Vocabulary_5",
                lessons: [
                    { title: "Lesson 1: Complex Descriptions", pageUrl: "../knowledge/vocabulary/level5/lesson-1.html" },
                    { title: "Lesson 2: Abstract Concepts", pageUrl: "../knowledge/vocabulary/level5/lesson-2.html" },
                    { title: "Lesson 3: Formal and Informal Language", pageUrl: "../knowledge/vocabulary/level5/lesson-3.html" },
                    { title: "Lesson 4: Compound Word Construction", pageUrl: "../knowledge/vocabulary/level5/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Specialized Vocabulary",
                subModuleId: "Vocabulary_6",
                lessons: [
                    { title: "Lesson 1: Science and Technology", pageUrl: "../knowledge/vocabulary/level6/lesson-1.html" },
                    { title: "Lesson 2: Arts and Literature", pageUrl: "../knowledge/vocabulary/level6/lesson-2.html" },
                    { title: "Lesson 3: Business and Economy", pageUrl: "../knowledge/vocabulary/level6/lesson-3.html" },
                    { title: "Lesson 4: Politics and Society", pageUrl: "../knowledge/vocabulary/level6/lesson-4.html" }
                    // Add more lessons
                ]
            }
        ]
    },
    {
        moduleName: "Grammar",
        moduleId: "grammarModule",
        subModules: [
            {
                subModuleName: "Basics of Universum Grammar",
                subModuleId: "Grammar_1",
                lessons: [
                    { title: "Lesson 1: Sentence Structure", pageUrl: "../knowledge/grammar/level1/lesson-1.html" },
                    { title: "Lesson 2: Pronouns and Simple Verbs", pageUrl: "../knowledge/grammar/level1/lesson-2.html" },
                    { title: "Lesson 3: Present, Past, and Future Tenses", pageUrl: "../knowledge/grammar/level1/lesson-3.html" },
                    { title: "Lesson 4: Yes/No Questions and Answers", pageUrl: "../knowledge/grammar/level1/lesson-4.html" }
                ]
            },
            {
                subModuleName: "Building Complexity",
                subModuleId: "Grammar_2",
                lessons: [
                    { title: "Lesson 1: Negation", pageUrl: "../knowledge/grammar/level2/lesson-1.html" },
                    { title: "Lesson 2: Plurals and Quantity", pageUrl: "../knowledge/grammar/level2/lesson-2.html" },
                    { title: "Lesson 3: Descriptive Language", pageUrl: "../knowledge/grammar/level2/lesson-3.html" },
                    { title: "Lesson 4: Prepositions and Directions", pageUrl: "../knowledge/grammar/level2/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Expanding Expressions",
                subModuleId: "Grammar_3",
                lessons: [
                    { title: "Lesson 1: Possessive Structures", pageUrl: "../knowledge/grammar/level3/lesson-1.html" },
                    { title: "Lesson 2: Comparatives and Superlatives", pageUrl: "../knowledge/grammar/level3/lesson-2.html" },
                    { title: "Lesson 3: Imperatives and Commands", pageUrl: "../knowledge/grammar/level3/lesson-3.html" },
                    { title: "Lesson 4: Question Words", pageUrl: "../knowledge/grammar/level3/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Advanced Structures",
                subModuleId: "Grammar_4",
                lessons: [
                    { title: "Lesson 1: Conjunctions and Complex Sentences", pageUrl: "../knowledge/grammar/level4/lesson-1.html" },
                    { title: "Lesson 2: Conditional Sentences", pageUrl: "../knowledge/grammar/level4/lesson-2.html" },
                    { title: "Lesson 3: Expressing Opinions and Emotions", pageUrl: "../knowledge/grammar/level4/lesson-3.html" },
                    { title: "Lesson 4: Indirect Speech and Reported Questions", pageUrl: "../knowledge/grammar/level4/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Advanced Communication",
                subModuleId: "Grammar_5",
                lessons: [
                    { title: "Lesson 1: Nuances of Politeness", pageUrl: "../knowledge/grammar/level5/lesson-1.html" },
                    { title: "Lesson 2: Cultural Expressions and Idioms", pageUrl: "../knowledge/grammar/level5/lesson-2.html" },
                    { title: "Lesson 3: Error Correction and Clarification", pageUrl: "../knowledge/grammar/level5/lesson-3.html" },
                    { title: "Lesson 4: Style and Register", pageUrl: "../knowledge/grammar/level5/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Mastering Fluency",
                subModuleId: "Grammar_6",
                lessons: [
                    { title: "Lesson 1: Debating and Persuasion", pageUrl: "../knowledge/grammar/level6/lesson-1.html" },
                    { title: "Lesson 2: Storytelling and Narration", pageUrl: "../knowledge/grammar/level6/lesson-2.html" },
                    { title: "Lesson 3: Academic and Formal Writing", pageUrl: "../knowledge/grammar/level6/lesson-3.html" },
                    { title: "Lesson 4: Humor and Playfulness in Language", pageUrl: "../knowledge/grammar/level6/lesson-4.html" }
                    // Add more lessons
                ]
            }
        ]
    },
    {
        moduleName: "Comprehension",
        moduleId: "comprehensionModule",
        subModules: [
            {
                subModuleName: "Foundations of Comprehension",
                subModuleId: "Comprehension_1",
                lessons: [
                    { title: "Lesson 1: Understanding Basic Greetings and Introductions", pageUrl: "../knowledge/comprehension/level1/lesson-1.html" },
                    { title: "Lesson 2: Numbers and Time", pageUrl: "../knowledge/comprehension/level1/lesson-2.html" },
                    { title: "Lesson 3: Common Phrases and Responses", pageUrl: "../knowledge/comprehension/level1/lesson-3.html" },
                    { title: "Lesson 4: Simple Instructions and Commands", pageUrl: "../knowledge/comprehension/level1/lesson-4.html" }
                ]
            },
            {
                subModuleName: "Everyday Situations",
                subModuleId: "Comprehension_2",
                lessons: [
                    { title: "Lesson 1: Shopping Conversations", pageUrl: "../knowledge/comprehension/level2/lesson-1.html" },
                    { title: "Lesson 2: Restaurant and Food", pageUrl: "../knowledge/comprehension/level2/lesson-2.html" },
                    { title: "Lesson 3: Directions and Transportation", pageUrl: "../knowledge/comprehension/level2/lesson-3.html" },
                    { title: "Lesson 4: Weather and Seasons", pageUrl: "../knowledge/comprehension/level2/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Expanding Knowledge",
                subModuleId: "Comprehension_3",
                lessons: [
                    { title: "Lesson 1: Educational Content", pageUrl: "../knowledge/comprehension/level3/lesson-1.html" },
                    { title: "Lesson 2: Work and Occupation Dialogues", pageUrl: "../knowledge/comprehension/level3/lesson-2.html" },
                    { title: "Lesson 3: Health and Wellness", pageUrl: "../knowledge/comprehension/level3/lesson-3.html" },
                    { title: "Lesson 4: Entertainment and Media", pageUrl: "../knowledge/comprehension/level3/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Advanced Interpretation",
                subModuleId: "Comprehension_4",
                lessons: [
                    { title: "Lesson 1: Narratives and Storytelling", pageUrl: "../knowledge/comprehension/level4/lesson-1.html" },
                    { title: "Lesson 2: Opinions and Arguments", pageUrl: "../knowledge/comprehension/level4/lesson-2.html" },
                    { title: "Lesson 3: Cultural and Historical Texts", pageUrl: "../knowledge/comprehension/level4/lesson-3.html" },
                    { title: "Lesson 4: Technical and Scientific Articles", pageUrl: "../knowledge/comprehension/level4/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Mastery of Comprehension",
                subModuleId: "Comprehension_5",
                lessons: [
                    { title: "Lesson 1: Abstract and Philosophical Texts", pageUrl: "../knowledge/comprehension/level5/lesson-1.html" },
                    { title: "Lesson 2: Poetry and Literature", pageUrl: "../knowledge/comprehension/level5/lesson-2.html" },
                    { title: "Lesson 3: News and Current Events", pageUrl: "../knowledge/comprehension/level5/lesson-3.html" },
                    { title: "Lesson 4: Formal and Academic Papers", pageUrl: "../knowledge/comprehension/level5/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Applied Comprehension",
                subModuleId: "Comprehension_6",
                lessons: [
                    { title: "Lesson 1: Interactive Scenarios and Role Plays", pageUrl: "../knowledge/comprehension/level6/lesson-1.html" },
                    { title: "Lesson 2: Listening and Audio Comprehension", pageUrl: "../knowledge/comprehension/level6/lesson-2.html" },
                    { title: "Lesson 3: Visual Comprehension and Interpretation", pageUrl: "../knowledge/comprehension/level6/lesson-3.html" },
                    { title: "Lesson 4: Comprehension Through Creation", pageUrl: "../knowledge/comprehension/level6/lesson-4.html" }
                    // Add more lessons
                ]
            }
        ]
    },
    {
        moduleName: "Math",
        moduleId: "mathModule",
        subModules: [
            {
                subModuleName: "Understanding Base-12 Basics",
                subModuleId: "Math_1",
                lessons: [
                    { title: "Lesson 1: Introduction to Base-12 System", pageUrl: "../knowledge/math/level1/lesson-1.html" },
                    { title: "Lesson 2: Counting in Base-12", pageUrl: "../knowledge/math/level1/lesson-2.html" },
                    { title: "Lesson 3: Basic Operations in Base-12", pageUrl: "../knowledge/math/level1/lesson-3.html" },
                    { title: "Lesson 4: Multiplication and Division in Base-12", pageUrl: "../knowledge/math/level1/lesson-4.html" }
                ]
            },
            {
                subModuleName: "Advancing with Arithmetic",
                subModuleId: "Math_2",
                lessons: [
                    { title: "Lesson 1: Carrying and Borrowing in Base-12", pageUrl: "../knowledge/math/level2/lesson-1.html" },
                    { title: "Lesson 2: Advanced Multiplication and Division", pageUrl: "../knowledge/math/level2/lesson-2.html" },
                    { title: "Lesson 3: Fractions in Base-12", pageUrl: "../knowledge/math/level2/lesson-3.html" },
                    { title: "Lesson 4: Converting Between Base-10 and Base-12", pageUrl: "../knowledge/math/level2/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Exploring Further Concepts",
                subModuleId: "Math_3",
                lessons: [
                    { title: "Lesson 1: Base-12 Place Values", pageUrl: "../knowledge/math/level3/lesson-1.html" },
                    { title: "Lesson 2: Using Base-12 in Practical Situations", pageUrl: "../knowledge/math/level3/lesson-2.html" },
                    { title: "Lesson 3: Decimals in Base-12", pageUrl: "../knowledge/math/level3/lesson-3.html" },
                    { title: "Lesson 4: Ratios and Proportions in Base-12", pageUrl: "../knowledge/math/level3/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Dive into Geometry and Algebra",
                subModuleId: "Math_4",
                lessons: [
                    { title: "Lesson 1: Geometric Shapes and Measurements in Base-12", pageUrl: "../knowledge/math/level4/lesson-1.html" },
                    { title: "Lesson 2: Algebraic Expressions in Base-12", pageUrl: "../knowledge/math/level4/lesson-2.html" },
                    { title: "Lesson 3: Graphing in Base-12", pageUrl: "../knowledge/math/level4/lesson-3.html" },
                    { title: "Lesson 4: Statistics and Probability in Base-12", pageUrl: "../knowledge/math/level4/lesson-4.html" }
                    // Add more lessons
                ]
            },
            {
                subModuleName: "Complex Applications and Theoretical Concepts",
                subModuleId: "Math_5",
                lessons: [
                    { title: "Lesson 1: Mathematical Puzzles in Base-12", pageUrl: "../knowledge/math/level5/lesson-1.html" },
                    { title: "Lesson 2: Exploring Patterns and Sequences in Base-12", pageUrl: "../knowledge/math/level5/lesson-2.html" },
                    { title: "Lesson 3: Base-12 in Science and Technology", pageUrl: "../knowledge/math/level5/lesson-3.html" },
                    { title: "Lesson 4: Theoretical Math in Base-12", pageUrl: "../knowledge/math/level5/lesson-4.html" }
                    // Add more lessons
                ]
            }
        ]
    },

    // Add more modules
];

let userLearningMode = "guided"; // Or "exploration"

// Placeholder for user's progress in each lesson
const dummyProgress = {
    vocabulary: {
        Vocabulary_1: {
            "Lesson 1: Common Phrases": {
                completed: false, // completion is determined by having an average quiz score of 60% or above (server) should not revert to false if it's already true
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

// Placeholder for recommended module, submodule, and lessons
const recommendations = {
    module: "Vocabulary",
    subModule: "Vocabulary_1",
    lessons: ["Lesson 1: Common Phrases"]
    // Assuming at least one lesson is recommended
};

document.addEventListener('DOMContentLoaded', function() {
    // userProgress = dummyProgress;
    // initializeKnowledgeCenter();
});

let userProgress = {}; // Initialize empty object to hold user progress
auth.onAuthStateChanged(async (user) => {
    // User is signed in, retrieve progress from Firestore
    try {
        const userProgressRef = doc(db, 'userProgress', user.uid);
        const progressDoc = await getDoc(userProgressRef);
        if (progressDoc.exists()) {
            userProgress = progressDoc.data(); // Use real progress data
            // Call any functions here that depend on userProgress being initialized
        } else {
            console.log("No user progress found. Using demo data.");
            userProgress = dummyProgress; // Fallback to dummy progress data
        }
    } catch (error) {
        console.error("Error fetching user progress:", error);
        userProgress = dummyProgress; // Fallback on error
    }
    
    // retrieve user profile from Firestore
    try {
        const userProfilesRef = doc(db, 'userProfiles', user.uid);
        const profilesDoc = await getDoc(userProfilesRef);
        
        if (profilesDoc.exists()) {
            const profileData = profilesDoc.data();
            const settings = profileData.settings; // This line is crucial since the settings are nested
            userLearningMode = settings.learningPath;
            initializeKnowledgeCenter();
        } else {
            console.log("No user profile found.");
            initializeKnowledgeCenter();
        }
    } catch (error) {
        console.error("Error fetching user profile: ", error);
        initializeKnowledgeCenter();
    }
});

function initializeKnowledgeCenter() {
    renderContent().then(() => {
        setTimeout(() => {
            expandModuleAndSubmodule();
            // Apply learning mode restrictions and update module progress
            applyLearningMode();
        }, 0.75); // Even a 0ms timeout can push the execution to the next tick of the event loop
    });
}

async function renderContent() {
    return new Promise((resolve, reject) => {
        const knowledgeCenter = document.getElementById('knowledgeCenter');
        knowledgeCenter.innerHTML = '';
        courseContent.forEach(module => {
            const isRecommendedModule = module.moduleName === recommendations.module;
            let moduleHtml = `
                <div class="module ${isRecommendedModule ? 'recommended' : ''}" id="${module.moduleId}" data-module="${module.moduleName}">
                    <h3>${module.moduleName}</h3>
                    <div class="progressBar"><div class="progress"><span class="progress-text"></span></div></div>
                    ${generateSubModulesHtml(module.subModules, isRecommendedModule, module.moduleName)}
                </div>
            `;
            knowledgeCenter.insertAdjacentHTML('beforeend', moduleHtml);
        });

        attachEventListeners(); // Attach event listeners after content is generated
        updateModuleProgress();

        resolve();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function expandModuleAndSubmodule() {
    const { module, submodule } = getQueryParams();
    // Capitalize the first letter of the module name to match the HTML attribute
    // const moduleNameCapitalized = capitalizeFirstLetter(module);
    
    // Debugging: Log the module and submodule values
    // console.log("Module:", module, "Submodule:", submodule);

    if (module) {
        // Find the module element using only the data-module attribute
        const moduleElement = document.querySelector(`[data-module="${capitalizeFirstLetter(module)}"]`);

        if (moduleElement) {
            // moduleElement.classList.add('expanded'); // Expand the module if found
            toggleModule(moduleElement);
            // Check if a submodule parameter exists and the module element was successfully found
            if (submodule) {
                // Find the submodule element within the module using only the data-sub-module attribute
                // Note: Adjust the attribute name if necessary to match your HTML exactly.
                const submoduleElement = moduleElement.querySelector(`[data-sub-module="${capitalizeFirstLetter(submodule)}"]`);

                if (submoduleElement) {
                    // submoduleElement.classList.add('expanded'); // Expand the submodule if found
                    toggleLessonsVisibility(submoduleElement);
                    // Scroll the submodule into view
                    submoduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    // Log or handle the case where the submodule wasn't found
                    console.error('Submodule element not found:', submodule);
                }
            } else {
                moduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Log or handle the case where the module wasn't found
            console.error('Module element not found:', module);
        }
    }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        module: params.get('module'),
        submodule: params.get('submodule')
    };
}

function updateModuleProgress() {
    document.querySelectorAll('.module').forEach(moduleElement => {
        if (!moduleElement.dataset.module) {
            console.error('Missing data-module attribute:', moduleElement);
            return;
        } 
        const moduleName = moduleElement.dataset.module.toLowerCase();
        let totalProgress = 0;
        let submoduleCount = 0;
        
        moduleElement.querySelectorAll('.subModule').forEach(subModuleElement => {
            const subModuleName = subModuleElement.dataset.subModule;
            const subModuleData = userProgress[moduleName] && userProgress[moduleName][subModuleName];
           
            if (subModuleData) {
                const totalLessons = Object.keys(subModuleData).length;
                let lessonsCompleted = 0;

                // Iterate through each lesson in the submodule
                Object.keys(subModuleData).forEach(lessonKey => {
                    const lesson = subModuleData[lessonKey];
                    // Check the lesson's completion status
                    if (lesson.completed) {
                        lessonsCompleted++;
                    }
                });

                const subModuleProgress = (lessonsCompleted / totalLessons) * 100;
                subModuleElement.querySelector('.progress').style.width = `${subModuleProgress}%`;

                totalProgress += subModuleProgress;
                submoduleCount++;
            }
        });

        if (submoduleCount > 0) {
            const moduleProgress = totalProgress / submoduleCount;
            moduleElement.querySelector('.progress').style.width = `${moduleProgress}%`;
            moduleElement.querySelector('.progress-text').textContent = `${moduleProgress.toFixed(0)}%`;
        }
    });
}

function toggleModule(module) {
    const isExpanded = module.classList.toggle('expanded');
    const subModules = module.querySelectorAll('.subModule');
    subModules.forEach(subModule => {
        subModule.style.display = isExpanded ? 'block' : 'none';
    });
}

function toggleLessonsVisibility(subModule) {
    const isExpanded = subModule.classList.toggle('expanded');
    const lessonsList = subModule.querySelector('.lessonsList');
    lessonsList.style.display = isExpanded ? 'block' : 'none';
}

function attachEventListeners() {
    // Module and submodule toggle functionality
    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function(event) {
            if (!event.target.closest('.subModule, a')) {
                toggleModule(event.currentTarget);
            }
        });
    });

    document.querySelectorAll('.subModule').forEach(subModule => {
        subModule.addEventListener('click', function(event) {
            // Prevents submodule toggle when clicking on links or any interactive element within it
            if (!event.target.closest('a, button, input, [onclick]')) {
                toggleLessonsVisibility(this);
            }
            event.stopPropagation(); // Prevent triggering module toggle
        });
    });

    // Apply click event listener to lesson links
    document.querySelectorAll('.lessonsList a').forEach(link => {
        link.addEventListener('click', (event) => {
            if (link.classList.contains('locked')) {
                event.preventDefault(); // Prevent navigation for locked lessons
                alert("This lesson is currently locked.");
            }
            event.stopPropagation(); // Ensure this doesn't trigger module/submodule toggling
        });
    });
}

function calculateAverageQuizScore(quizScores) {
    if (quizScores.length === 0) {
        return "Incomplete";
    } else {
        const sum = quizScores.reduce((acc, score) => acc + score, 0);
        const average = sum / quizScores.length;
        return average.toFixed(2) + '%'; // Format to two decimal places
    }
}

function generateSubModulesHtml(subModules, isParentModuleRecommended, moduleName) {
    return subModules.map(subModule => {
        const isRecommendedSubModule = isParentModuleRecommended && subModule.subModuleId === recommendations.subModule;
        return `
            <div class="subModule ${isRecommendedSubModule ? 'recommended' : ''}" data-sub-module="${subModule.subModuleId}">
                <div class="subModuleHeader"><h4>${subModule.subModuleName}</h4></div>
                <div class="progressBar"><div class="progress"></div></div>
                <ul class="lessonsList">
                    ${subModule.lessons.map(lesson => {
                        const lessonData = userProgress[moduleName.toLowerCase()]?.[subModule.subModuleId]?.[lesson.title] || {};
                        const averageScoreText = calculateAverageQuizScore(lessonData.quizScores || []);
                        
                        const isAccessible = isLessonRecommendedOrCompleted(lesson.title, subModule.subModuleId, moduleName);
                        return `<li>
                            <a href="${lesson.pageUrl}" class="lessonLink ${isAccessible ? '' : 'locked'}" data-lesson="${lesson.title}">
                                ${lesson.title} <span class="quizScore">${averageScoreText}</span>
                            </a>
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function isLessonRecommendedOrCompleted(lessonTitle, subModuleId, moduleName) {
    // In Guided Learning mode, a lesson is accessible if it's recommended or already completed
    if (userLearningMode === "guided") {
        const moduleData = userProgress[moduleName.toLowerCase()];
        const subModuleData = moduleData && moduleData[subModuleId];
        const lessonData = subModuleData && subModuleData[lessonTitle];
        const isCompleted = lessonData && lessonData.completed;
        const isRecommended = recommendations.module === moduleName &&
                              recommendations.subModule === subModuleId &&
                              recommendations.lessons.includes(lessonTitle);
        
        return isRecommended || isCompleted;
    }
    // In Self-Directed Exploration, all lessons are accessible
    return true;
}

function applyLearningMode() {
    // For "Self-Directed Exploration", no need to lock lessons, so no action is required
    // Adjust based on userLearningMode
    if (userLearningMode === "guided") {
        lockOrUnlockLessons();
    }
    // The locking logic is integrated within the generation of the lesson links
    // This function could be extended for additional logic specific to learning modes
}

function lockOrUnlockLessons() {
    let unlockNext = false;

    Object.keys(courseContent).forEach((moduleKey, moduleIndex, moduleArray) => {
        const module = courseContent[moduleKey];

        Object.keys(module.subModules).forEach((subModuleKey, subModuleIndex, subModuleArray) => {
            const subModule = module.subModules[subModuleKey];

            subModule.lessons.forEach((lesson, lessonIndex, lessonArray) => {
                const lessonData = userProgress[moduleKey]?.[subModuleKey]?.[lesson.title];
                const isCompleted = lessonData?.completed;
                const isRecommended = recommendations.lessons.includes(lesson.title); // Assuming recommendations is an array of lesson titles

                if (unlockNext) {
                    unlockLesson(lesson);
                    unlockNext = false; // Reset after unlocking unless it's recommended
                }

                if (isCompleted) {
                    console.log("Found completed lesson: " + lesson.title)
                    unlockNext = true; // Set to unlock the next lesson only if current lesson is completed and not just recommended
                 } else if (isRecommended) {
                    console.log("Unlocking lesson: " + lesson.title)
                    unlockLesson(lesson);
                    // Do not set unlockNext true for recommended lessons to prevent unlocking the next lesson automatically
               }

                // Handling the last lesson in the submodule
                if (isCompleted && lessonIndex === lessonArray.length - 1) {
                    handleLastLessonUnlocking(moduleIndex, subModuleIndex, moduleArray, subModuleArray, module, subModule);
                    unlockNext = false; // Ensure we don't unlock an additional lesson after moving to the next module/submodule
                }
            });
        });
    });
}

function handleLastLessonUnlocking(moduleIndex, subModuleIndex, moduleArray, subModuleArray, module, subModule) {
    if (subModuleIndex < subModuleArray.length - 1) {
        // Unlock the first lesson of the next submodule if not the last submodule
        const nextSubModuleKey = subModuleArray[subModuleIndex + 1];
        const nextSubModule = module.subModules[nextSubModuleKey];
        unlockLesson(nextSubModule.lessons[0]);
    } else if (moduleIndex < moduleArray.length - 1) {
        // Unlock the first lesson of the next module's first submodule if not the last module
        const nextModuleKey = moduleArray[moduleIndex + 1];
        const nextModule = courseContent[nextModuleKey];
        const nextSubModuleKeys = Object.keys(nextModule.subModules);
        if (nextSubModuleKeys.length > 0) {
            const nextSubModule = nextModule.subModules[nextSubModuleKeys[0]];
            unlockLesson(nextSubModule.lessons[0]);
        }
    }
}

function unlockLesson(lesson) {
    // Implement the logic to remove 'locked' class based on lesson's identifier
    const lessonSelector = `.lessonLink[data-lesson="${lesson.title}"]`;
    const lessonElement = document.querySelector(lessonSelector);
    if (lessonElement) {
        lessonElement.classList.remove('locked');
    }
}
