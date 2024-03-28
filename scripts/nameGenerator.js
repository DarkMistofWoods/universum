document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.querySelector('button');
    const nameOutput = document.getElementById('nameOutput');

    generateButton.addEventListener('click', function() {
        const attr1 = document.getElementById('attribute1').value;
        const attr2 = document.getElementById('attribute2').value;
        const attr3 = document.getElementById('attribute3').value;

        // Ensure all dropdowns are selected
        if (!attr1 || !attr2 || !attr3) {
            console.log("Please select options from all dropdowns.");
            return; // Exit if not all selections are made
        }

        let generatedName = generateName(attr1, attr2, attr3);
        nameOutput.value = generatedName;
    });

    function generateName(attr1, attr2, attr3) {
        let firstPartLength = Math.max(5, Math.floor((attr1.length + attr2.length) / 2));
        let secondPartLength = Math.max(5, attr3.length);

        let firstName = capitalizeFirstLetter(simplifyAttribute(attr1 + attr2, firstPartLength));
        let lastName = capitalizeFirstLetter(simplifyAttribute(attr3, secondPartLength));

        return firstName + ' ' + lastName;
    }

    function simplifyAttribute(attribute, targetLength) {
        if (attribute.length < targetLength) {
            while (attribute.length < targetLength) {
                attribute += attribute;
            }
            attribute = attribute.substring(0, targetLength);
        } else if (attribute.length > targetLength) {
            attribute = attribute.substring(0, targetLength);
        }

        // Append a random vowel if the attribute ends on a consonant
        if (isConsonant(attribute.charAt(attribute.length - 1))) {
            attribute += getRandomVowel();
        }

        return attribute;
    }

    function isConsonant(char) {
        return ['a', 'e', 'i', 'o', 'u'].indexOf(char.toLowerCase()) === -1;
    }

    function getRandomVowel() {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels[Math.floor(Math.random() * vowels.length)];
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
