// Step 1: Convert the first name
function convertFirstName(firstName) {
    // Simplified mappings of English phonetics to Universum equivalents
    const consonantMap = {
        'b': 'b', 'd': 'd', 'f': 'f', 'g': 'g',
        'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n',
        'p': 'p', 'r': 'r', 's': 's', 't': 't',
        'v': 'v', 'z': 'z', // Using direct mappings where possible
        // Additional mappings as needed, potentially handling more complex conversions
    };

    const vowelMap = {
        'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
        // Universum focuses on simple vowel sounds common across languages
    };

    // Convert the first name into a sequence of Universum-compatible sounds
    let universumName = '';
    for (let i = 0; i < firstName.length; i++) {
        const char = firstName[i].toLowerCase();

        // Map consonants
        if (consonantMap[char]) {
            universumName += consonantMap[char];
        }

        // Map vowels
        if (vowelMap[char]) {
            universumName += vowelMap[char];
        }

        // Ensure the name adheres to the CVCV pattern as closely as possible
        // This might involve adding vowels between consonants or adjusting the structure slightly
        if (i % 2 == 0 && vowelMap[firstName[i+1]?.toLowerCase()] === undefined) {
            universumName += 'a'; // Default filler vowel for simplicity
        }
    }

    return universumName;
}

// Step 2: Map virtues to Universum words
function getVirtueInUniversum(virtue) {
    const virtueMap = {
        "Honor": "Valco", // Created, inspired by "noble"
        "Courage": "Corva", // Using "strong" as a base, implying strength of character
        "Sacrifice": "Donsi", // Created, inspired by "dedication"
        "Compassion": "Patico", // Shortened form of "empathy"
        "Respect": "Rev", // Created, inspired by "reverence"
        "Loyalty": "Fiduca", // Inspired by "fidelity"
        "Honesty": "Verdi", // Inspired by "verity" (truth)
        "Prudence": "Sapra", // Direct from the lexicon
        "Grace": "Graca", // Created, inspired by "elegance"
        "Forgiveness": "Perdo", // Inspired by "pardon"
        "Humility": "Humil", // Created, inspired by "modesty"
        "Authenticity": "Esiver", // Created, capturing the essence of being authentic
        "Excellence": "Exal", // Shortened form of "excellence"
        "Kindness": "Benev", // Using "friend" to imply kindness
        "Gratitude": "Grati", // Inspired by "gratitude"
        "Patience": "Patia", // Created, closely following English for familiarity
        "Commitment": "Dedic", // Shortened form of "commitment"
        "Tenacity": "Tenas", // Created, inspired by "tenacity"
        "Tact": "Sensi", // Inspired by "diplomacy" for dealing with situations tactfully
        "Generosity": "Genro", // Shortened form of "generosity"
        "Empathy": "Empat", // Direct use, given its relevance
        "Contentment": "Conte", // Created, inspired by "content"
        "Assertiveness": "Assef", // Shortened form, maintaining the original essence
        "Cooperation": "Coper", // Shortened form of "cooperation"
        "Adaptability": "Adapta", // Shortened form of "adaptability"
        "Integrity": "Integ", // Created, inspired by "integrity"
        "Service": "Servo", // Shortened form of "service"
        "Duty": "Dute", // Created, inspired by "duty"
    };
    return virtueMap[virtue] || "";
}

// Step 3: Map elements to Universum words
function getElementInUniversum(element) {
    const elementMap = {
        "Earth": "Arb", // Tree, representing the earth
        "Fire": "Sol", // Sun, representing fire
        // Additional mappings for other elements...
    };
    return elementMap[element] || "";
}

// Main function to generate the name
function generateName(firstName, virtue, element) {
    const universumFirstName = convertFirstName(firstName);
    const universumVirtue = getVirtueInUniversum(virtue);
    const universumElement = getElementInUniversum(element);

    // Combine the elements to form a Universum name
    const universumName = `${universumFirstName}-${universumVirtue}${universumElement}`;
    return universumName;
}

// Example usage
document.querySelector("button").addEventListener("click", function() {
    const firstName = document.getElementById("firstName").value;
    const virtue = document.getElementById("attribute1").value;
    const element = document.getElementById("attribute2").value;

    const universumName = generateName(firstName, virtue, element);
    document.getElementById("nameOutput").value = universumName;
});
