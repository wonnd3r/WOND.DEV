const inputField = document.getElementById("inputText");
const display = document.getElementById("display");
const wpmInput = document.getElementById("wpm");
const soundToggle = document.getElementById("soundToggle");
const resetButton = document.getElementById("resetButton");

// State variables
let soundEnabled = true;
let currentTimeout = null;
let isDisplaying = false;

// Audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTick() {
    if (!soundEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
}

// WPM input handling
wpmInput.addEventListener("input", function() {
    let value = Math.min(Math.max(this.value, 0), 5000);
    this.value = value;
});

// Sound toggle
soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle("sound-on");
    soundToggle.classList.toggle("sound-off");
    soundToggle.innerHTML = soundEnabled ? 
        '<i class="fas fa-volume-up"></i>' : 
        '<i class="fas fa-volume-mute"></i>';
});

// Reset button - stops current display
resetButton.addEventListener("click", () => {
    if (isDisplaying) {
        clearTimeout(currentTimeout);
        isDisplaying = false;
        display.classList.remove("show");
        display.textContent = "";
    }
});

// Main functionality
inputField.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        if (this.value.trim()) {
            // Stop any existing display
            if (isDisplaying) {
                clearTimeout(currentTimeout);
                isDisplaying = false;
            }
            displayWords(this.value.trim());
            this.value = "";
        }
    }
});

function displayWords(text) {
    const words = text.split(" ");
    let index = 0;
    const wpm = parseInt(wpmInput.value);
    const delay = 60000 / wpm; // Convert WPM to ms per word
    isDisplaying = true;
    
    display.classList.remove("show");
    
    function showNextWord() {
        if (!isDisplaying) return;
        
        if (index < words.length) {
            display.textContent = words[index];
            display.classList.add("show");
            playTick();
            index++;
            
            currentTimeout = setTimeout(() => {
                display.classList.remove("show");
                currentTimeout = setTimeout(showNextWord, delay / 2);
            }, delay);
        } else {
            isDisplaying = false;
        }
    }
    
    showNextWord();
}