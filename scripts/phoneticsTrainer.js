document.addEventListener('DOMContentLoaded', function() {
    // Example data - replace with dynamic loading if necessary
    const phoneticsData = {
        "p_sound": {
            visual: "path/to/p_sound.png",
            audio: "path/to/p_sound.mp3"
        },
        "a_vowel": {
            visual: "path/to/a_vowel.png",
            audio: "path/to/a_vowel.mp3"
        }
        // Add more sounds
    };

    const visualAid = document.getElementById('visualAid');
    const audioSample = document.getElementById('audioSample');

    function loadPhonetic(soundKey) {
        const data = phoneticsData[soundKey];
        if(data) {
            visualAid.innerHTML = `<img src="${data.visual}" alt="Visual for ${soundKey}">`;
            audioSample.src = data.audio;
        }
    }

    // Example function to start with a specific sound
    loadPhonetic('p_sound');

    // Implement pronunciation games logic here
});