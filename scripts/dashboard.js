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
            renderCustomNetworkVisualization(progressData);
        } else {
            console.log("No user progress found. Using demo data.");
            
            renderCustomNetworkVisualization(dummyProgress); // Use demo data
        }
    } catch (error) {
        console.error("Error initializing dashboard: ", error);
    }
}

function renderCustomNetworkVisualization(userProgress) {
    const svg = document.querySelector('#networkVisualization svg');
    svg.setAttribute('viewBox', '0 0 800 600'); // Adjust as needed for full view in the container
    svg.innerHTML = ''; // Clear existing visualization

    const moduleRadius = 20; // Largest
    const submoduleRadius = 10; // Medium
    const lessonRadius = 5; // Smallest
    const center = { x: 400, y: 300 }; // Central point for the layout
    let moduleAngle = 0;
    const moduleDistance = 200; // Distance from center to module
    const submoduleDistance = 100; // Distance from module to submodule
    const lessonDistance = 25; // Distance from submodule to lesson

    const moduleKeys = Object.keys(userProgress);
    const moduleAngleIncrement = (2 * Math.PI) / moduleKeys.length;
    const modulePositions = []; // Store module positions for interconnecting them later

    moduleKeys.forEach((moduleKey, moduleIndex) => {
        const modulePosition = {
            x: center.x + moduleDistance * Math.cos(moduleAngle),
            y: center.y + moduleDistance * Math.sin(moduleAngle)
        };
        modulePositions.push(modulePosition); // Store position for later use
        renderNode(svg, modulePosition.x, modulePosition.y, moduleKey, moduleRadius, '#5F736F');

        const submoduleKeys = Object.keys(userProgress[moduleKey]);
        const submoduleAngleIncrement = (2 * Math.PI) / submoduleKeys.length;
        let submoduleAngle = 0;

        submoduleKeys.forEach((submoduleKey, submoduleIndex) => {
            const submodulePosition = {
                x: modulePosition.x + submoduleDistance * Math.cos(submoduleAngle),
                y: modulePosition.y + submoduleDistance * Math.sin(submoduleAngle)
            };
            renderNode(svg, submodulePosition.x, submodulePosition.y, submoduleKey, submoduleRadius, '#80A69F');
            renderLine(svg, modulePosition.x, modulePosition.y, submodulePosition.x, submodulePosition.y);

            const lessonKeys = Object.keys(userProgress[moduleKey][submoduleKey]);
            const lessonAngleIncrement = (2 * Math.PI) / lessonKeys.length;
            let lessonAngle = 0;

            lessonKeys.forEach((lessonKey, lessonIndex) => {
                const lessonPosition = {
                    x: submodulePosition.x + lessonDistance * Math.cos(lessonAngle),
                    y: submodulePosition.y + lessonDistance * Math.sin(lessonAngle)
                };
                renderNode(svg, lessonPosition.x, lessonPosition.y, lessonKey, lessonRadius, '#95BFB8');
                renderLine(svg, submodulePosition.x, submodulePosition.y, lessonPosition.x, lessonPosition.y);

                lessonAngle += lessonAngleIncrement;
            });

            submoduleAngle += submoduleAngleIncrement;
        });

        moduleAngle += moduleAngleIncrement;
    });

    // Interconnect all module nodes
    modulePositions.forEach((pos1, index1) => {
        modulePositions.forEach((pos2, index2) => {
            if (index2 > index1) {
                renderLine(svg, pos1.x, pos1.y, pos2.x, pos2.y);
            }
        });
    });
}

function renderNode(svg, x, y, label, radius, fillColor) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor);
    svg.appendChild(circle);
}

function renderLine(svg, x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#CCCCCC');
    line.setAttribute('stroke-width', '1');
    svg.insertBefore(line, svg.firstChild); // Ensure lines are under nodes
}

// Placeholder for user's progress in each lesson
const dummyProgress = {
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
    math: {
        math1: {
            "Lesson 1: Introduction to Base-12 System": false,
            "Lesson 2: Counting in Base-12": false,
            "Lesson 3: Basic Operations in Base-12": false,
            "Lesson 4: Multiplication and Division in Base-12": false
        },
        math2: {
            "Lesson 1: Carrying and Borrowing in Base-12": false,
            "Lesson 2: Advanced Multiplication and Division": false,
            "Lesson 3: Fractions in Base-12": false,
            "Lesson 4: Converting Between Base-10 and Base-12": false
        },
        math3: {
            "Lesson 1: Base-12 Place Values": false,
            "Lesson 2: Using Base-12 in Practical Situations": false,
            "Lesson 3: Decimals in Base-12": false,
            "Lesson 4: Ratios and Proportions in Base-12": false
        },
        math4: {
            "Lesson 1: Geometric Shapes and Measurements in Base-12": false,
            "Lesson 2: Algebraic Expressions in Base-12": false,
            "Lesson 3: Graphing in Base-12": false,
            "Lesson 4: Statistics and Probability in Base-12": false
        },
        math5: {
            "Lesson 1: Mathematical Puzzles in Base-12": false,
            "Lesson 2: Exploring Patterns and Sequences in Base-12": false,
            "Lesson 3: Base-12 in Science and Technology": false,
            "Lesson 4: Theoretical Math in Base-12": false
        }
    },
    // Include other modules and submodules as necessary
};

document.addEventListener('DOMContentLoaded', () => {
    // initializeDashboard();
});