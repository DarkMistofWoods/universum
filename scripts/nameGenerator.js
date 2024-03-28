document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.querySelector('button');
    const nameOutput = document.getElementById('nameOutput');
    const termsOutput = document.getElementById('termsOutput'); // Assume there's a div for displaying the terms

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

        let derivation = generateName(attr1, attr2, attr3);
        let fullName = derivation.firstName + ' ' + derivation.lastName;
        nameOutput.value = fullName;

        termsOutput.innerHTML = `
            <p><strong>First Name Derived From:</strong> ${attr1} + ${attr2} + ${attr3} -> ${derivation.firstName}</p>
            <p><strong>Last Name Derived From:</strong> ${attr3} + influences from ${attr1} & ${attr2} -> ${derivation.lastName}</p>
        `;
    });

    function generateName(attr1, attr2, attr3) {
        let firstName = capitalizeFirstLetter(constructRandomBlendedName(attr1, attr2, attr3));
        let lastName = capitalizeFirstLetter(constructRandomBlendedName(attr1, attr2, attr3, firstName));

        return {firstName, lastName};
    }

    function constructRandomBlendedName(attr1, attr2, attr3, existingName = "") {
        let parts = [attr1, attr2, attr3].map(attr => attr.substring(0, 2));
        shuffleArray(parts);

        let baseName = parts.join('');
        baseName = adjustNameLength(baseName, 6); // Ensuring a minimum length for variety

        if(existingName) {
            baseName = ensureUniqueEnding(baseName, existingName);
        }

        return baseName;
    }

    function adjustNameLength(name, targetLength) {
        while (name.length < targetLength) {
            name += isVowel(name.charAt(name.length - 1)) ? getRandomConsonant() : getRandomVowel();
        }
        return name;
    }

    function ensureUniqueEnding(name, otherName) {
        if (name.slice(-2) === otherName.slice(-2)) {
            name = name.slice(0, -2) + getRandomVowel() + getRandomConsonant();
        }
        return name;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function isVowel(char) {
        return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
    }

    function getRandomVowel() {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels[Math.floor(Math.random() * vowels.length)];
    }

    function getRandomConsonant() {
        const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        return consonants[Math.floor(Math.random() * consonants.length)];
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
