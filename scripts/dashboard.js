import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is not signed in, redirect to login.html
        await initializeDashboard(user);
    } else {
        // User is signed in, continue with page-specific logic
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
            
            // Now, draw the language tree based on userProgress
            drawLanguageTree(progressData);
        } else {
            console.log("No user progress found. Using demo data.");
            const progressData = userProgress;
            // use demo data to update the progress visualizer

            // Now, draw the language tree based on userProgress
            drawLanguageTree(progressData);
        }
        
    } catch (error) {
        console.error("Error initializing dashboard: ", error);
    }
}

// Placeholder for user's progress in each lesson
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

function drawLanguageTree(progress) {
    const canvas = document.getElementById('languageTreeCanvas');
    if (!canvas.getContext) {
        console.error("Canvas is not supported by your browser.");
        return;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
    
    const container = document.querySelector('.language-tree');
    // Ensure the container's dimensions are fetched correctly
    if (container) {
        canvas.width = container.offsetWidth; // Set canvas width to container width
        canvas.height = container.offsetHeight; // Set canvas height to container height
    } else {
        console.error('Language tree container not found.');
        return;
    }

    // Now, you can draw on the canvas. Here, you adjust the starting point
    // and initial length to better use the available canvas space.
    drawTreeBase(ctx, canvas);
    // Adjust the starting parameters to utilize the new canvas size fully
    drawBranch(ctx, canvas.width / 2, canvas.height, -Math.PI / 2, canvas.height / 4, 0);
}

function drawTreeBase(ctx, canvas) {
    // Example function to draw the base of the tree
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height);
    ctx.lineTo(canvas.width / 2, canvas.height - 50); // Simple trunk
    ctx.stroke();
}

function drawBranch(ctx, startX, startY, angle, length, depth = 0) {
    if (depth > 2) return; // Limit the recursion depth for modules, submodules, and lessons

    const endX = startX + Math.cos(angle) * length;
    const endY = startY - Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Randomly decide the number of sub-branches (e.g., submodules or lessons)
    let subBranches = depth === 0 ? Object.keys(userProgress).length : Math.random() * 4 + 1;

    for (let i = 0; i < subBranches; i++) {
        // Generate a new angle and length for each sub-branch
        const newAngle = angle + Math.random() * 0.5 - 0.25; // Adjust angle randomness
        const newLength = length * (0.7 + Math.random() * 0.3); // Adjust length randomness
        drawBranch(ctx, endX, endY, newAngle, newLength, depth + 1);
    }

    // Optionally, draw a leaf or fruit at the end of each final branch
    if (depth === 2) {
        ctx.beginPath();
        ctx.arc(endX, endY, 5, 0, Math.PI * 2); // Simple circle for demonstration
        ctx.fillStyle = 'green'; // Or use different colors for different statuses
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // initializeDashboard();
    // drawLanguageTree(userProgress);
    window.addEventListener('resize', () => {
        drawLanguageTree(userProgress); // Redraw the tree when the window is resized (uses demo data. change this)
    });    
});