// play.js - Add at the beginning
let isOffline = !navigator.onLine;

// Optional: Show offline indicator
if (isOffline) {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.style.position = 'fixed';
    offlineIndicator.style.bottom = '10px';
    offlineIndicator.style.right = '10px';
    offlineIndicator.style.padding = '5px 10px';
    offlineIndicator.style.background = 'rgba(0,0,0,0.7)';
    offlineIndicator.style.color = 'white';
    offlineIndicator.style.borderRadius = '5px';
    offlineIndicator.style.zIndex = '1000';
    offlineIndicator.textContent = 'Playing Offline';
    document.body.appendChild(offlineIndicator);
}

// Get the current level from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = parseInt(urlParams.get('level')) || 1;
const unlockedLevels = JSON.parse(localStorage.getItem('hyperHuntUnlockedLevels')) || [1];
if (!unlockedLevels.includes(currentLevel)) {
    alert('This level is locked! Complete the previous levels to unlock it.');
    window.location.href = 'index.html';
    // No return needed here - the redirect will stop execution
}

// Access LEVEL_CONFIG from the global window object
const levelConfig = window.LEVEL_CONFIG[currentLevel];

// Get total levels count (add this at the top with other constants)
const totalLevels = Object.keys(window.LEVEL_CONFIG).length;

// --- Game Constants (now dynamic from levelConfig) ---
let INITIAL_CHANCES = levelConfig.chances;
let ANIMAL_SPEED = levelConfig.animalSpeed;
let ANIMALS_TO_CATCH = levelConfig.animalsToCatch;
let TIME_LIMIT = levelConfig.timeLimit;
const TAUNT_DISPLAY_TIME = 1500;
const MIN_HIDE_TIME = 1000; // These are not in levelConfig, keeping as constants
const MAX_HIDE_TIME = 4000; // These are not in levelConfig, keeping as constants

// --- Game State Variables ---
let chancesLeft;
let animalsCaught = 0;
let gameRunning = false;
let gamePaused = false;
let animationFrameId;
let timeLeft;
let timerInterval;

// Array to hold all animal objects
let animals = [];

// --- DOM Elements ---
const gameArea = document.getElementById('game-area');
const chancesLeftSpan = document.getElementById('chances-left');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const tauntBox = document.getElementById('taunt-box');
const gameOverScreen = document.getElementById('game-over-screen');
const playAgainBtn = document.getElementById('play-again-btn');
const backToLevelsBtn = document.getElementById('back-to-levels-btn');
const levelSuccessScreen = document.getElementById('level-success-screen');
const successNextLevelBtn = document.getElementById('success-next-level-btn');
const successHomeBtn = document.getElementById('success-home-btn');
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingProgress = document.getElementById('loading-progress');
const loadingTipBox = document.querySelector('#loading-screen .loading-tip-box');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeMessage = document.getElementById('welcome-message');
const startGameButton = document.getElementById('start-game-button');
const gameInfo = document.getElementById('game-info');
const pauseScreen = document.getElementById('pause-screen');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const quitButton = document.getElementById('quit-button');
const animalIconContainer = document.getElementById('animal-icon-container');
const fullAnimalImg = document.getElementById('full-animal-img');
const levelCompleteTitle = document.getElementById('level-complete-title');
const successMessage = document.getElementById('success-message');

// --- Audio Elements (references to HTML elements) ---
const buttonClickSound = document.getElementById('button-click-sound');
const animalCatchSound = document.getElementById('animal-catch-sound');
const backgroundMusic = document.getElementById('background-music');
const tauntSound = document.getElementById('taunt-sound');
backgroundMusic.loop = true;

// --- Helper Functions for Colors ---
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

function darkenHex(hex, percent) {
    let f = parseInt(hex.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// --- Sound Functions ---
function playButtonSound() {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch(e => console.log("Button sound error:", e));
}

function playAnimalCatchSound() {
    animalCatchSound.currentTime = 0;
    animalCatchSound.play().catch(e => console.log("Catch sound error:", e));
}

function playTauntSound() {
    tauntSound.currentTime = 0;
    tauntSound.play().catch(e => console.log("Taunt sound error:", e));
}

function stopAllSounds() {
    buttonClickSound.pause();
    animalCatchSound.pause();
    tauntSound.pause();
    backgroundMusic.pause();
}

function handleBackgroundMusic() {
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(e => {
        console.log("Music autoplay blocked, will play after interaction");
        // Attempt to play on first user interaction
        document.addEventListener('click', () => {
            backgroundMusic.play().catch(e => console.log("Still can't play music:", e));
        }, { once: true });
    });
}

// --- Game UI Update Function ---
function updateUI() {
    chancesLeftSpan.textContent = chancesLeft;
    scoreSpan.textContent = `${animalsCaught}/${ANIMALS_TO_CATCH}`;
    timerSpan.textContent = timeLeft;

    if (timeLeft <= 10) {
        timerSpan.style.color = 'var(--level-danger-color)';
    } else if (timeLeft <= 20) {
        timerSpan.style.color = 'var(--level-warning-color)';
    } else {
        timerSpan.style.color = 'var(--level-text-color)'; // Use secColor for normal timer
    }
}

// --- Game Timer Logic ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gamePaused && gameRunning) {
            timeLeft--;
            updateUI();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (animalsCaught < ANIMALS_TO_CATCH) {
                    loseGame("Time's up!");
                }
                return; // Exit to prevent further timer updates
            }
        }
    }, 1000);
}

// --- Taunt Display Logic ---
let tauntTimeout;
function displayTaunt(type) {
    if (!gameRunning || gamePaused) return;

    const tauntsForType = levelConfig.taunts[type];
    if (!tauntsForType || tauntsForType.length === 0) {
        console.warn(`No taunts defined for type: ${type}`);
        return;
    }
    const randomTaunt = tauntsForType[Math.floor(Math.random() * tauntsForType.length)];

    clearTimeout(tauntTimeout);
    tauntBox.textContent = randomTaunt;
    tauntBox.style.opacity = 1;

    if (type === 'onmiss' || type === 'onhide') { // Play sound for misses and when animal hides
        playTauntSound();
    }

    tauntTimeout = setTimeout(() => {
        tauntBox.style.opacity = 0;
    }, TAUNT_DISPLAY_TIME);
}

// --- Collision Detection ---
function isHittingAnimal(animalObj, clickX, clickY) {
    return clickX >= animalObj.x && clickX <= animalObj.x + animalObj.width &&
        clickY >= animalObj.y && clickY <= animalObj.y + animalObj.height;
}

// --- Game Click Handler ---
function handleGameClick(event) {
    if (!gameRunning || gamePaused) return;

    const rect = gameArea.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let hitAnimal = false;

    for (let i = 0; i < animals.length; i++) {
        const animal = animals[i];
        if (!animal.isCaught && isHittingAnimal(animal, clickX, clickY) && !animal.isHidden) {
            // Hit a visible, uncaught animal
            animal.isCaught = true;
            // Add the splatter effect
            const splatterColor = levelConfig.colors.splatterColor || '255, 255, 255';
            createSplatterEffect(animal.x + animal.width / 2, animal.y + animal.height / 2, splatterColor);

            // Caught Animation
            animal.element.style.transition = "transform 0.5s ease-in, opacity 0.5s ease-in";
            animal.element.style.transform = `translate(${animal.x}px, ${animal.y - 100}px) scale(1.5) rotate(360deg)`;
            animal.element.style.opacity = "0";

            // Floating Text
            showFloatingText(clickX, clickY, "+1", "#4CAF50");

            // Score Pulse
            scoreSpan.classList.add('score-pulse');
            setTimeout(() => scoreSpan.classList.remove('score-pulse'), 300);

            // animal.element.classList.add('caught'); // Removed to allow custom animation
            animalsCaught++;
            playAnimalCatchSound();
            displayTaunt("caught"); // Use "caught" taunt type
            hitAnimal = true;
            updateUI();
            // Clear individual animal's hiding/showing timers when caught
            clearTimeout(animal.hideTimeout);
            clearTimeout(animal.showTimeout);
            break; // Only one animal can be hit per click
        } else if (!animal.isCaught && isHittingAnimal(animal, clickX, clickY) && animal.isHidden) {
            // Clicked on a hidden animal's previous spot
            displayTaunt("onhide"); // Use "onhide" taunt type
            hitAnimal = true;
            break; // Count as a "hit" on a hidden animal, but still a miss for catching
        }
    }

    if (!hitAnimal) { // If no animal was hit (either visible or hidden)
        chancesLeft--;
        displayTaunt("onmiss"); // Use "onmiss" taunt type

        // Screen Shake Effect
        gameArea.classList.add('screen-shake');
        setTimeout(() => gameArea.classList.remove('screen-shake'), 500);

        // Floating Text for Miss
        showFloatingText(clickX, clickY, "MISS!", "#ff4444");

        updateUI();

        if (chancesLeft <= 0) {
            loseGame("Out of chances!");
            return; // Immediately exit after losing
        }
    }

    if (animalsCaught >= ANIMALS_TO_CATCH) {
        winGame(`You caught all the ${levelConfig.name.toLowerCase()}s!`);
    }
}

function showFloatingText(x, y, text, color) {
    const floatEl = document.createElement('div');
    floatEl.classList.add('floating-text');
    floatEl.textContent = text;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.style.color = color;
    gameArea.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1000);
}

// --- Animal Visibility Logic ---
function toggleAnimalVisibility(animal) {
    if (animal.isCaught || !gameRunning || gamePaused) return;

    animal.isHidden = !animal.isHidden;
    animal.element.style.opacity = animal.isHidden ? 0 : 1;
    animal.lastVisibilityChangeTime = Date.now(); // Record time of last visibility change

    const delay = animal.isHidden
        ? Math.random() * (MAX_HIDE_TIME - MIN_HIDE_TIME) + MIN_HIDE_TIME
        : Math.random() * 3000 + 2000; // Visible for 2-5 seconds

    if (animal.isHidden) {
        animal.hideTimeout = setTimeout(() => toggleAnimalVisibility(animal), delay);
        animal.hideExpectedEndTime = Date.now() + delay; // Store expected end time
    } else {
        animal.showTimeout = setTimeout(() => toggleAnimalVisibility(animal), delay);
        animal.showExpectedEndTime = Date.now() + delay; // Store expected end time
    }
}

// --- Main Animation Loop for Animals ---
function moveAnimals() {
    if (!gameRunning || gamePaused) return;

    const gameAreaWidth = gameArea.clientWidth;
    const gameAreaHeight = gameArea.clientHeight;

    animals.forEach(animal => {
        if (animal.isCaught || animal.isHidden) return; // Don't move caught or hidden animals

        let nextX = animal.x + animal.dx;
        let nextY = animal.y + animal.dy;

        // Bounce off walls
        if (nextX <= 0 || nextX >= gameAreaWidth - animal.width) {
            animal.dx *= -1;
            nextX = animal.x + animal.dx; // Adjust position to prevent sticking
        }
        if (nextY <= 0 || nextY >= gameAreaHeight - animal.height) {
            animal.dy *= -1;
            nextY = animal.y + animal.dy; // Adjust position to prevent sticking
        }

        animal.x = nextX;
        animal.y = nextY;
        animal.element.style.transform = `translate(${animal.x}px, ${animal.y}px)`;
    });

    animationFrameId = requestAnimationFrame(moveAnimals);
}

// --- Initialize Animals for a New Game ---
function initializeAnimals() {
    // Clear any existing animals from previous games
    animals.forEach(animal => {
        animal.element.remove();
        clearTimeout(animal.hideTimeout);
        clearTimeout(animal.showTimeout);
    });
    animals = []; // Reset the array

    for (let i = 0; i < ANIMALS_TO_CATCH; i++) {
        const animalElement = document.createElement('img');
        animalElement.src = levelConfig.images.animalHead;
        animalElement.classList.add('animal');
        gameArea.appendChild(animalElement);

        const newAnimal = {
            element: animalElement,
            x: Math.random() * (gameArea.clientWidth - 80),
            y: Math.random() * (gameArea.clientHeight - 80),
            dx: (Math.random() > 0.5 ? 1 : -1) * ANIMAL_SPEED,
            dy: (Math.random() > 0.5 ? 1 : -1) * ANIMAL_SPEED,
            width: 80,
            height: 80,
            isHidden: false,
            isCaught: false,
            hideTimeout: null,
            showTimeout: null,
            lastVisibilityChangeTime: Date.now(),
            hideExpectedEndTime: null,
            showExpectedEndTime: null
        };

        animals.push(newAnimal);

        // Entrance Animation
        animalElement.style.transform = `translate(${newAnimal.x}px, ${newAnimal.y}px) scale(0)`;
        animalElement.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

        // Staggered entrance
        setTimeout(() => {
            animalElement.style.transform = `translate(${newAnimal.x}px, ${newAnimal.y}px) scale(1)`;
        }, i * 100);

        // Initial delay before first hide/show cycle begins for each animal
        const initialDelay = Math.random() * 3000;
        newAnimal.showTimeout = setTimeout(() => {
            toggleAnimalVisibility(newAnimal); // Start their individual hiding/showing cycle
        }, initialDelay);
        newAnimal.showExpectedEndTime = Date.now() + initialDelay;
    }
}

// --- Game Start Function ---
function startGame() {
    // Check if level is unlocked
    if (!isLevelUnlocked(currentLevel)) {
        alert('This level is locked! Complete previous levels to unlock it.');
        window.location.href = 'index.html';
        return;
    }
    loadingScreen.style.display = 'none'; // Hide the entire loading/start screen
    gameArea.style.display = 'block';
    gameInfo.style.display = 'flex';
    pauseScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    levelSuccessScreen.style.display = 'none';

    chancesLeft = INITIAL_CHANCES;
    animalsCaught = 0;
    gameRunning = true;
    gamePaused = false;
    timeLeft = TIME_LIMIT;

    tauntBox.style.opacity = 0;
    stopAllSounds(); // Ensure all sounds are stopped before new game music starts

    initializeAnimals(); // Setup all animals for the new game
    updateUI();
    startTimer(); // Start the main game timer
    cancelAnimationFrame(animationFrameId); // Stop any previous animation
    animationFrameId = requestAnimationFrame(moveAnimals); // Start the main animation loop
    handleBackgroundMusic(); // Start background music

    pauseButton.innerHTML = '<img class="mb-1" src="assets/icons/pause.png" alt="pause icon" width="20" height="20"> ';

    // Update document title with current level name
    document.title = `Precision: ${levelConfig.name}`;
}

// --- Pause/Resume Game Functions ---
function togglePauseGame() {
    if (!gameRunning) return;

    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    if (!gameRunning || gamePaused) return;

    gamePaused = true;
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrameId);
    backgroundMusic.pause();

    animals.forEach(animal => {
        if (!animal.isCaught) {
            // Clear existing timeouts and calculate remaining time
            if (animal.hideTimeout) {
                clearTimeout(animal.hideTimeout);
                animal.remainingTime = Math.max(0, animal.hideExpectedEndTime - Date.now());
                animal.hideExpectedEndTime = null;
            } else if (animal.showTimeout) {
                clearTimeout(animal.showTimeout);
                animal.remainingTime = Math.max(0, animal.showExpectedEndTime - Date.now());
                animal.showExpectedEndTime = null;
            }
        }
    });

    pauseScreen.style.display = 'flex';
    pauseButton.innerHTML = '<img class="mb-1" src="assets/icons/play.png" alt="play icon" width="20" height="20">';
}

function resumeGame() {
    if (!gamePaused || !gameRunning) return;

    gamePaused = false;
    pauseScreen.style.display = 'none';
    backgroundMusic.play().catch(e => console.log("Music resume error:", e));

    startTimer();
    animationFrameId = requestAnimationFrame(moveAnimals);

    animals.forEach(animal => {
        if (!animal.isCaught && animal.remainingTime !== null) {
            // Resume the specific timeout for each animal
            if (animal.isHidden) {
                animal.hideTimeout = setTimeout(() => toggleAnimalVisibility(animal), animal.remainingTime);
                animal.hideExpectedEndTime = Date.now() + animal.remainingTime;
            } else {
                animal.showTimeout = setTimeout(() => toggleAnimalVisibility(animal), animal.remainingTime);
                animal.showExpectedEndTime = Date.now() + animal.remainingTime;
            }
            animal.remainingTime = null; // Clear remaining time after resuming
        }
    });

    pauseButton.innerHTML = '<img class="mb-1" src="assets/icons/pause.png" alt="pause icon" width="20" height="20">';
}
/**
 * Creates a splatter/blast effect at a given position.
 * @param {number} x The x-coordinate of the center of the blast.
 * @param {number} y The y-coordinate of the center of the blast.
 * @param {string} color The color of the particles (e.g., '255, 255, 255').
 */
function createSplatterEffect(x, y, color) {
    const gameArea = document.getElementById('game-area');
    const numParticles = 15; // Number of particles to create
    const maxDistance = 80;  // How far the particles will travel

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('splatter-particle');
        particle.style.backgroundColor = `rgba(${color}, 0.8)`;

        // Randomize the direction and distance for each particle
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * maxDistance;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--splatter-x', `${dx}px`);
        particle.style.setProperty('--splatter-y', `${dy}px`);

        gameArea.appendChild(particle);

        // Remove the particle from the DOM after the animation completes
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}
// --- Game End Functions ---
// Helper function to calculate score and stars
function calculateScoreAndStars() {
    const timePercentage = Math.max(0, timeLeft / TIME_LIMIT);
    const chancesPercentage = Math.max(0, chancesLeft / INITIAL_CHANCES);

    // Weighted score: 600 points for time, 400 points for chances
    // Total max score = 1000
    const timeScore = timePercentage * 600;
    const chancesScore = chancesPercentage * 400;
    const totalScore = Math.round(timeScore + chancesScore);

    let stars = 1;
    if (totalScore >= 666) stars = 2; // Approx 2/3 of 1000
    if (totalScore >= 900) stars = 3; // High threshold for 3 stars

    return { score: totalScore, stars: stars };
}

// --- Game End Functions ---
function winGame(message) {
    // Stop the timer first
    clearInterval(timerInterval);
    gameRunning = false; // Ensure game is marked as not running
    stopAllSounds();

    const result = calculateScoreAndStars();
    const score = result.score;
    const starsEarned = result.stars;

    // Update progress for THIS level only
    const progress = JSON.parse(localStorage.getItem('gameProgress')) || {
        unlockedLevels: 1,  // Tracks which levels are unlocked
        levelStars: {},      // Tracks stars earned for each completed level
        levelScores: {}      // NEW: Track raw scores
    };

    // Only update stars/score if earned more than before
    const currentBestScore = progress.levelScores ? (progress.levelScores[currentLevel] || 0) : 0;

    if (score > currentBestScore) {
        progress.levelStars[currentLevel] = starsEarned;
        if (!progress.levelScores) progress.levelScores = {};
        progress.levelScores[currentLevel] = score;
    }

    // Unlock next level ONLY if 2 or more stars are earned
    let unlockedNewLevel = false;
    if (starsEarned >= 2) {
        if (currentLevel >= progress.unlockedLevels) {
            progress.unlockedLevels = Math.min(currentLevel + 1, totalLevels);
            unlockedNewLevel = true;
        }
    }

    localStorage.setItem('gameProgress', JSON.stringify(progress));

    // Also update the simple unlockedLevels for compatibility
    localStorage.setItem('unlockedLevels', progress.unlockedLevels);

    // Show success screen
    successMessage.innerHTML = `${message}<br>
        <div class="score-display">Score: ${score}/1000</div>
        <div class="stars-earned">
            ${'<img src="assets/icons/star-filled.png" width="24" height="24">'.repeat(starsEarned)}
            ${'<img src="assets/icons/star-empty.png" width="24" height="24">'.repeat(3 - starsEarned)}
        </div>
        ${starsEarned < 2 ? '<p class="text-warning small mt-2">You need 2 stars to unlock the next level!</p>' : ''}`;

    levelSuccessScreen.style.display = 'flex';
    playAnimalCatchSound();

    // Update progress in localStorage (redundant call removed, logic integrated above)

    // Disable Pause Button
    pauseButton.disabled = true;
    pauseButton.style.opacity = '0.5';

    successNextLevelBtn.onclick = () => {
        playButtonSound();

        if (starsEarned < 2 && !unlockedNewLevel && !isLevelUnlocked(currentLevel + 1)) {
            alert("You need at least 2 stars to unlock the next level! Try again.");
            window.location.reload();
            return;
        }

        const nextLevel = currentLevel + 1;

        // Check if we're in an iframe or standalone window
        if (window.parent !== window) {
            // We're in an iframe - tell parent window to unlock next level
            window.parent.postMessage({
                type: 'levelCompleted',
                level: currentLevel,
                nextLevel: nextLevel
            }, '*');

            // Redirect to next level or back to index
            if (window.LEVEL_CONFIG[nextLevel]) {
                window.location.href = `play.html?level=${nextLevel}`;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            // We're in a standalone window - update localStorage directly
            // unlockNextLevel(currentLevel); // Already handled above

            if (window.LEVEL_CONFIG[nextLevel] && isLevelUnlocked(nextLevel)) {
                window.location.href = `play.html?level=${nextLevel}`;
            } else {
                window.location.href = 'index.html';
            }
        }
    };

    successHomeBtn.onclick = () => {
        playButtonSound();
        unlockNextLevel(currentLevel);

        if (window.opener) {
            // If opened from index.html, tell it to refresh
            window.opener.postMessage({
                type: 'unlockedLevel',
                level: currentLevel + 1
            }, '*');
        }
        window.location.href = 'index.html';
    };
}

function unlockNextLevel(completedLevel) {
    const nextLevel = completedLevel + 1;
    if (nextLevel > totalLevels) return; // Don't unlock beyond last level

    // Get current progress
    const progress = JSON.parse(localStorage.getItem('hyperHuntUnlockedLevels')) || [1];

    // Add next level if not already unlocked
    if (!progress.includes(nextLevel)) {
        progress.push(nextLevel);
        progress.sort((a, b) => a - b);
        localStorage.setItem('hyperHuntUnlockedLevels', JSON.stringify(progress));
        console.log(`Unlocked level ${nextLevel}`);
    }

    // Also update the simple unlockedLevels value for compatibility
    const simpleUnlocked = Math.max(parseInt(localStorage.getItem('unlockedLevels')) || 1, nextLevel);
    localStorage.setItem('unlockedLevels', simpleUnlocked);
}

// Helper function to calculate stars earned (customize based on your game metrics)
function calculateStarsEarned() {
    // More sophisticated star calculation
    const timePercentage = timeLeft / TIME_LIMIT;
    const chancesPercentage = chancesLeft / INITIAL_CHANCES;

    // Weighted score (adjust weights as needed)
    const score = (timePercentage * 0.6) + (chancesPercentage * 0.4);

    if (score >= 0.8) return 3;    // 3 stars for 80%+ perfect
    if (score >= 0.5) return 2;    // 2 stars for 50%+
    return 1;                      // 1 star for completion
}

// Update level progress in localStorage
function updateLevelProgress(completedLevel, starsEarned) {
    // Get current progress or initialize if doesn't exist
    const progress = JSON.parse(localStorage.getItem('gameProgress')) || {
        unlockedLevels: 1,
        levelStars: {}
    };

    // Update unlocked levels if needed
    if (completedLevel >= progress.unlockedLevels) {
        progress.unlockedLevels = Math.min(completedLevel + 1, totalLevels);
    }

    // Only update stars if earned more than before
    if (!progress.levelStars[completedLevel] || starsEarned > progress.levelStars[completedLevel]) {
        progress.levelStars[completedLevel] = starsEarned;
    }

    // Save back to localStorage
    localStorage.setItem('gameProgress', JSON.stringify(progress));

    // Also update the simpler unlockedLevels value for compatibility
    localStorage.setItem('unlockedLevels', progress.unlockedLevels);
}

// Check if a level is unlocked
function isLevelUnlocked(levelNum) {
    // First check the simple version (for backward compatibility)
    const simpleUnlocked = parseInt(localStorage.getItem('unlockedLevels')) || 1;
    if (levelNum <= simpleUnlocked) return true;

    // Then check the detailed progress object
    const progress = JSON.parse(localStorage.getItem('gameProgress'));
    return progress && levelNum <= (progress.unlockedLevels || 1);
}


function loseGame(message) {
    gameRunning = false;
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrameId);
    stopAllSounds();

    animals.forEach(animal => {
        clearTimeout(animal.hideTimeout);
        clearTimeout(animal.showTimeout);
    });

    gameOverScreen.style.display = 'flex';
    document.getElementById('game-over-message').textContent = `${message}`;
    document.getElementById('game-over-score').textContent = `${levelConfig.name}s Caught: ${animalsCaught}/${ANIMALS_TO_CATCH}`;
    playTauntSound();

    // Disable Pause Button
    pauseButton.disabled = true;
    pauseButton.style.opacity = '0.5';
}

// --- Asset Loading with Progress ---
function loadAssets() {
    // Ensure loading elements are visible
    document.querySelector('.loader').style.display = 'block';
    loadingProgress.style.display = 'block';
    document.getElementById('loading-bar-container').style.display = 'block';
    loadingTipBox.style.display = 'none'; // Hide welcome box during loading

    const assetsToLoad = [];

    // Add images to assetsToLoad
    assetsToLoad.push(levelConfig.images.background);
    assetsToLoad.push(levelConfig.images.animalHead);
    assetsToLoad.push(levelConfig.images.fullAnimal);
    if (levelConfig.images.mobileBackground) {
        assetsToLoad.push(levelConfig.images.mobileBackground);
    }
    if (levelConfig.images.bodyBackground) {
        assetsToLoad.push(levelConfig.images.bodyBackground);
    }

    // Add sound paths to assetsToLoad (these are just paths for tracking)
    assetsToLoad.push(levelConfig.sounds.click);
    assetsToLoad.push(levelConfig.sounds.catch);
    assetsToLoad.push(levelConfig.sounds.background);
    assetsToLoad.push(levelConfig.sounds.taunt);

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;

    function assetLoaded() {
        loadedCount++;
        const progress = Math.round((loadedCount / totalAssets) * 100);
        loadingBar.style.width = `${progress}%`;
        loadingProgress.textContent = `Loading ${levelConfig.name}... ${progress}%`;

        if (loadedCount === totalAssets) {
            // All assets are "prepared" (images loaded, audio sources set)
            // Now, hide loading progress and show the welcome/start game box
            document.querySelector('.loader').style.display = 'none';
            loadingProgress.style.display = 'none';
            document.getElementById('loading-bar-container').style.display = 'none';
            loadingTipBox.style.display = 'flex'; // Show the welcome box

            // Initialize game elements that depend on loaded assets/config
            initGameUI();
        }
    }

    assetsToLoad.forEach(src => {
        // Determine if it's an image or audio based on extension (simple check)
        if (src.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            const img = new Image();
            img.src = src;
            img.onload = assetLoaded;
            img.onerror = assetLoaded; // Still count as loaded even if error
        } else if (src.match(/\.(mp3|wav|ogg)$/i)) {
            // Assign src to the corresponding global audio element and load it
            // Directly increment loadedCount for audio after setting src and calling load()
            // This prevents hangs if oncanplaythrough doesn't fire consistently
            if (src === levelConfig.sounds.click) {
                buttonClickSound.src = src;
                buttonClickSound.load();
            } else if (src === levelConfig.sounds.catch) {
                animalCatchSound.src = src;
                animalCatchSound.load();
            } else if (src === levelConfig.sounds.background) {
                backgroundMusic.src = src;
                backgroundMusic.load();
            } else if (src === levelConfig.sounds.taunt) {
                tauntSound.src = src;
                tauntSound.load();
            }
            assetLoaded(); // Immediately count audio as loaded after initiating load
        }
    });
}

// --- Initialize Game UI (after assets are loaded) ---
function initGameUI() {
    // Set CSS Custom Properties (variables) on the root element
    document.documentElement.style.setProperty('--level-bg-color', levelConfig.colors.bgColor);
    document.documentElement.style.setProperty('--level-text-color', levelConfig.colors.textColor);
    document.documentElement.style.setProperty('--level-sec-color', levelConfig.colors.secColor);
    document.documentElement.style.setProperty('--level-danger-color', levelConfig.colors.dangerColor);
    document.documentElement.style.setProperty('--level-warning-color', levelConfig.colors.warningColor);

    // For rgba calculations, we need RGB components.
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    }
    document.documentElement.style.setProperty('--level-sec-color-rgb', hexToRgb(levelConfig.colors.secColor));
    document.documentElement.style.setProperty('--level-bg-color-rgb', hexToRgb(levelConfig.colors.bgColor));

    // Calculate a darker version of secColor for hover states
    function darkenHex(hex, percent) {
        let f = parseInt(hex.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }
    document.documentElement.style.setProperty('--level-sec-color-darker', darkenHex(levelConfig.colors.secColor, -0.1)); // Darken by 10%

    // Set body background image (from config)
    document.body.style.backgroundImage = `url('${levelConfig.images.bodyBackground}')`;
    // Set gameArea background image (from config)
    gameArea.style.backgroundImage = `url('${levelConfig.images.background}')`;

    // Handle mobile background for game-area
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const applyMobileBackground = () => {
        if (mediaQuery.matches && levelConfig.images.mobileBackground) {
            gameArea.style.backgroundImage = `url('${levelConfig.images.mobileBackground}')`;
        } else {
            gameArea.style.backgroundImage = `url('${levelConfig.images.background}')`;
        }
    };
    applyMobileBackground(); // Apply on init
    mediaQuery.addEventListener('change', applyMobileBackground); // Apply on resize

    // Update animal icon in UI
    animalIconContainer.innerHTML = `<img style="width:52px;" src="${levelConfig.images.animalHead}" alt="${levelConfig.name}">`;

    // Update success screen image and title
    fullAnimalImg.src = levelConfig.images.fullAnimal;
    levelCompleteTitle.textContent = `${levelConfig.name} Complete!`;

    // Update initial text on the welcome/start game box
    welcomeTitle.textContent = `Welcome to ${levelConfig.name}!`;
    welcomeMessage.textContent = levelConfig.description || `Get ready to catch some ${levelConfig.name.toLowerCase()}s!`;
    startGameButton.textContent = `Start ${levelConfig.name}`;

    // Set audio sources (already done in loadAssets, but no harm in re-setting)
    buttonClickSound.src = levelConfig.sounds.click;
    animalCatchSound.src = levelConfig.sounds.catch;
    backgroundMusic.src = levelConfig.sounds.background;
    tauntSound.src = levelConfig.sounds.taunt;

    // Apply specific background color for game-info, using dynamic base color
    gameInfo.style.backgroundColor = 'var(--level-bg-color)'; /* Changed to solid background */
}

// --- Event Listeners ---
startGameButton.addEventListener('click', function () {
    playButtonSound();
    startGame(); // This will hide the loading/start screen and begin the game
});

pauseButton.addEventListener('click', function () {
    playButtonSound();
    togglePauseGame();
});

resumeButton.addEventListener('click', function (e) {
    e.stopPropagation();
    playButtonSound();
    resumeGame();
});

restartButton.addEventListener('click', function (e) {
    e.stopPropagation();
    playButtonSound();
    pauseScreen.style.display = 'none';
    // Reset game state properly
    chancesLeft = INITIAL_CHANCES;
    animalsCaught = 0;
    timeLeft = TIME_LIMIT;
    startGame();
});

quitButton.addEventListener('click', function (e) {
    e.stopPropagation();
    playButtonSound();
    window.location.href = 'index.html';
});

gameArea.addEventListener('click', handleGameClick);

playAgainBtn.addEventListener('click', function () {
    playButtonSound();
    startGame();
});

backToLevelsBtn.addEventListener('click', function () {
    playButtonSound();
    window.location.href = 'index.html';
});

window.addEventListener('resize', function () {
    if (gameRunning) {
        // Re-apply mobile background on resize if media query matches
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        if (mediaQuery.matches && levelConfig.images.mobileBackground) {
            gameArea.style.backgroundImage = `url('${levelConfig.images.mobileBackground}')`;
        } else {
            gameArea.style.backgroundImage = `url('${levelConfig.images.background}')`;
        }

        animals.forEach(animal => {
            animal.x = Math.max(0, Math.min(animal.x, gameArea.clientWidth - animal.width));
            animal.y = Math.max(0, Math.min(animal.y, gameArea.clientHeight - animal.height));
            animal.element.style.transform = `translate(${animal.x}px, ${animal.y}px)`;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Other initializations...
    loadAssets(); // This eventually leads to initGameUI which sets audio srcs

    // Add a general document click listener to attempt music playback
    // This is a common pattern to bypass autoplay restrictions on the first interaction.
    let musicStarted = false;
    document.addEventListener('click', () => {
        if (!musicStarted && backgroundMusic.src) { // Only try if not already started and source is set
            backgroundMusic.volume = 0.3; // Set volume before playing
            backgroundMusic.play().then(() => {
                console.log("Background music started via initial document click.");
                musicStarted = true;
            }).catch(e => {
                console.warn("Background music autoplay still blocked on initial click:", e);
                // Keep the 'start game button' listener for handleBackgroundMusic as fallback
            });
        }
    }, { once: true }); // Make sure this listener is removed after the first click
});


