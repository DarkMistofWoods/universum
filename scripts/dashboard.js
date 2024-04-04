import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, continue with page-specific logic
        await initializeDashboard(user);
    } else {
        // User is not signed in, redirect to login
        window.location.href = 'login.html';
    }
});

async function initializeDashboard(user) {
    try {
        const userProfilesRef = doc(db, 'userProfiles', user.uid);
        const profilesDoc = await getDoc(userProfilesRef);
        
        if (profilesDoc.exists()) {
            const profileData = profilesDoc.data();
            document.getElementById('userName').textContent = profileData.displayName || "User";
            // Populate additional UI elements with user profile data as necessary
        } else {
            console.log("No user profile found.");
        }

        // Further dashboard initialization that depends on user being present,
        // like fetching userProgress, can continue here...

        const userProgressRef = doc(db, 'userProgress', user.uid);
        const progressDoc = await getDoc(userProgressRef); 
        
        if (progressDoc.exists()) {
            const progressData = progressDoc.data();
            // call functions to update the progress visualizer here
            initializeNetworkVisualization(progressData)
        } else {
            console.log("No user progress found. Using demo data.");
            const progressData = userProgress;
            // use demo data to update the progress visualizer
            initializeNetworkVisualization(progressData)
        }
    } catch (error) {
        console.error("Error initializing dashboard: ", error);
    }
}

function initializeNetworkVisualization(userProgress) {
    const container = document.getElementById('networkVisualization');
    const data = prepareDataForVisualization(userProgress);
    const options = {}; // Customize vis.js options as needed
    new vis.Network(container, data, options);
}

function prepareDataForVisualization(userProgress) {
    const nodes = [];
    const edges = [];

    // Example of transforming lesson completion into nodes
    let idCounter = 1;
    for (const moduleKey in userProgress) {
        for (const lessonKey in userProgress[moduleKey]) {
            nodes.push({ id: idCounter, label: lessonKey, color: userProgress[moduleKey][lessonKey] ? "#7BE141" : "#C2FABC", shape: "dot", size: userProgress[moduleKey][lessonKey] ? 15 : 10 });
            idCounter++;
        }
        // Add edges between consecutive lessons for simplicity
        for (let i = 1; i < idCounter - 1; i++) {
            edges.push({ from: i, to: i + 1, arrows: 'to', length: 200 });
        }
    }

    return { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
}

// Placeholder for user's progress in each lesson, submodule, module
const userProgress = {
    vocabulary: {
        vocabulary1: {
            "Lesson 1: Common Phrases": true, // true indicates completion
            "Lesson 2: Numbers and Counting": true,
            "Lesson 3: Colors and Shapes": true,
            "Lesson 4: Time and Days": false,
        },
        vocabulary2: {
            "Lesson 1: Family and People": false,
            "Lesson 2: Food and Drink": false,
            "Lesson 3: Clothing and Body": false,
            "Lesson 4: Home and Daily Routines": false,
        },
        vocabulary3: {
            "Lesson 1: Nature and Weather": false,
            "Lesson 2: City and Transportation": false,
            "Lesson 3: Shopping and Money": false,
            "Lesson 4: Health and Emergency": false,
        },
        vocabulary4: {
            "Lesson 1: Emotions and Opinions": false,
            "Lesson 2: Hobbies and Leisure": false,
            "Lesson 3: Education and Work": false,
            "Lesson 4: Travel and Culture": false,
        },
        vocabulary5: {
            "Lesson 1: Complex Descriptions": false,
            "Lesson 2: Abstract Concepts": false,
            "Lesson 3: Formal and Informal Language": false,
            "Lesson 4: Compound Word Construction": false,
        },
        vocabulary6: {
            "Lesson 1: Science and Technology": false,
            "Lesson 2: Arts and Literature": false,
            "Lesson 3: Business and Economy": false,
            "Lesson 4: Politics and Society": false,
        }
    },
    grammar: {
        grammar1: {
            "Lesson 1: Sentence Structure": true, // true indicates completion
            "Lesson 2: Pronouns and Simple Verbs": true,
            "Lesson 3: Present, Past, and Future Tenses": false,
            "Lesson 4: Yes/No Questions and Answers": false
        },
        grammar2: {
            "Lesson 1: Negation": false,
            "Lesson 2: Plurals and Quantity": false,
            "Lesson 3: Descriptive Language": false,
            "Lesson 4: Prepositions and Directions": false
        },
        grammar3: {
            "Lesson 1: Possessive Structures": false,
            "Lesson 2: Comparatives and Superlatives": false,
            "Lesson 3: Imperatives and Commands": false,
            "Lesson 4: Question Words": false
        },
        grammar4: {
            "Lesson 1: Conjunctions and Complex Sentences": false,
            "Lesson 2: Conditional Sentences": false,
            "Lesson 3: Expressing Opinions and Emotions": false,
            "Lesson 4: Indirect Speech and Reported Questions": false
        },
        grammar5: {
            "Lesson 1: Nuances of Politeness": false,
            "Lesson 2: Cultural Expressions and Idioms": false,
            "Lesson 3: Error Correction and Clarification": false,
            "Lesson 4: Style and Register": false
        },
        grammar6: {
            "Lesson 1: Debating and Persuasion": false,
            "Lesson 2: Storytelling and Narration": false,
            "Lesson 3: Academic and Formal Writing": false,
            "Lesson 4: Humor and Playfulness in Language": false
        }
    },
    comprehension: {
        comprehension1: {
            "Lesson 1: Understanding Basic Greetings and Introductions": false, // true indicates completion
            "Lesson 2: Numbers and Time": false,
            "Lesson 3: Common Phrases and Responses": false,
            "Lesson 4: Simple Instructions and Commands": false
        },
        comprehension2: {
            "Lesson 1: Shopping Conversations": false,
            "Lesson 2: Restaurant and Food": false,
            "Lesson 3: Directions and Transportation": false,
            "Lesson 4: Weather and Seasons": false
        },
        comprehension3: {
            "Lesson 1: Educational Content": false,
            "Lesson 2: Work and Occupation Dialogues": false,
            "Lesson 3: Health and Wellness": false,
            "Lesson 4: Entertainment and Media": false
        },
        comprehension4: {
            "Lesson 1: Narratives and Storytelling": false,
            "Lesson 2: Opinions and Arguments": false,
            "Lesson 3: Cultural and Historical Texts": false,
            "Lesson 4: Technical and Scientific Articles": false
        },
        comprehension5: {
            "Lesson 1: Abstract and Philosophical Texts": false,
            "Lesson 2: Poetry and Literature": false,
            "Lesson 3: News and Current Events": false,
            "Lesson 4: Formal and Academic Papers": false
        },
        comprehension6: {
            "Lesson 1: Interactive Scenarios and Role Plays": false,
            "Lesson 2: Listening and Audio Comprehension": false,
            "Lesson 3: Visual Comprehension and Interpretation": false,
            "Lesson 4: Comprehension Through Creation": false
        }
    },
    // Include other modules and submodules as necessary
};

document.addEventListener('DOMContentLoaded', () => {
    // initializeDashboard();
});