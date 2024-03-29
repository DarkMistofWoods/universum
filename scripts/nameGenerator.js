document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.querySelector('button');
    const nameOutput = document.getElementById('nameOutput');

    const termMappings = {
        kevi: "Sage",
        batoki: "Power",
        kasomi: "Innovation",
        lumiso: "Harmony",
        risoli: "Happiness",
        pafoli: "Fluidity",
        taneli: "Stability",
        kubini: "Passion",
        lumini: "Freedom",
        ki: "Student",
        vi: "Leader",
        kaso: "Maker",
        seni: "Elder",
        bato: "Warrior",
        solumi: "Caregiver",
        pali: "One",
        telo: "Two",
        basi: "Three",
        kuna: "Four",
        muto: "Five",
        nifi: "Six",
        sato: "Seven",
        luko: "Eight",
        rupo: "Nine",
        vemi: "X",
        lana: "ε"
    };

    generateButton.addEventListener('click', function() {
        const attr1 = document.getElementById('attribute1').value;
        const attr2 = document.getElementById('attribute2').value;
        const attr3 = document.getElementById('attribute3').value;

        if (!attr1 || !attr2 || !attr3) {
            console.log("Please select options from all dropdowns.");
            return;
        }

        let firstName = capitalizeFirstLetter(generateRandomName([attr1, attr2], true)); // For first name, pass true
        let lastName = "";
        // Ensure lastName is distinct from firstName
        do {
            lastName = capitalizeFirstLetter(generateRandomName([attr1, attr2, attr3], false)); // For last name, pass false
        } while (lastName.length < firstName.length); // Ensure last name is not shorter than the first name

        nameOutput.value = firstName + ' ' + lastName;

         // Create or select the termsOutput div
         let termsOutput = document.getElementById('termsOutput');
         if (!termsOutput) {
             termsOutput = document.createElement('div');
             termsOutput.id = 'termsOutput';
             // Find the container to which the new div should be appended
             const container = document.querySelector('.container');
             // Insert the termsOutput div right after the nameOutput element within the container
             container.insertBefore(termsOutput, nameOutput.nextSibling);
        }

        termsOutput.innerHTML = `
            <p><strong>First Name Derived From:</strong> ${attr1}, ${attr2} -> ${firstName}</p>
            <p><strong>Last Name Derived From:</strong> ${attr1}, ${attr2}, ${attr3} -> ${lastName}</p>
        `;
    });

    function generateRandomName(attributes, isFirstName) {
        // Combine and shuffle the attributes to form a pool of syllables
        let syllables = [];
        attributes.forEach(attr => {
            syllables = syllables.concat(extractSyllables(attr));
        });
        shuffleArray(syllables);

        // Construct a name ensuring it doesn't exceed a specific number of syllables
        let name = "";
        let maxSyllables = isFirstName ? 3 : 5; // Example: First names up to 3 syllables, last names up to 5
        for (let i = 0; i < maxSyllables && i < syllables.length; i++) {
            name += syllables[i];
        }

        return adjustToCVCV(name);
    }
    
    function extractSyllables(word) {
        let syllables = [];
        for (let i = 0; i < word.length; i += 2) {
            syllables.push(word.substring(i, Math.min(i + 2, word.length)));
        }
        return syllables;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // ES6 array destructuring for swapping
        }
    }
    
    function isVowel(char) {
        return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
    }
    
    function getRandomVowel() {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels[Math.floor(Math.random() * vowels.length)];
    }
    
    /*
    function getRandomConsonant() {
        const consonants = ['p', 't', 'b', 'k', 'm', 'n', 'f', 'v', 's', 'l', 'r'];
        return consonants[Math.floor(Math.random() * consonants.length)];
    }
    */
   
    /*
    function getRandomInt(min, max) {
        // The maximum is inclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    */

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function adjustToCVCV(name) {
        // If the name length after construction is odd, remove the last character before adjustment
        if (name.length % 2 !== 0) {
            name = name.slice(0, -1);
        }
        // Ensure the name ends with a vowel, but without extending beyond the desired length
        if (!isVowel(name.charAt(name.length - 1))) {
            // If the last character is not a vowel, replace it instead of adding a new character
            name = name.slice(0, -1) + getRandomVowel();
        }
        return name;
    }
});
