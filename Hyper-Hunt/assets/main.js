// Ensure GAME_CONFIG and LEVEL_CONFIG are loaded
if (typeof window.GAME_CONFIG === 'undefined' || typeof window.LEVEL_CONFIG === 'undefined') {
    console.error("GAME_CONFIG or LEVEL_CONFIG not found. Please ensure config/gameConfig.js and config/levelConfig.js are loaded correctly.");
    document.body.innerHTML = "<div style='color: white; text-align: center; font-size: 1.5em; padding: 50px;'>Error: Game configuration not loaded. Please check your config files.</div>";
}

const totalLevels = Object.keys(window.LEVEL_CONFIG).length;
let unlockedLevels = parseInt(localStorage.getItem('unlockedLevels')) || 1;

const levelRow = document.getElementById('levelRow');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const completeMessage = document.getElementById('complete-message');
const completeDetails = document.getElementById('complete-details');
const playNextLevelBtn = document.getElementById('play-next-level-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const gameTitleElement = document.getElementById('game-title');
const fireflyContainer = document.querySelector('.firefly-container');
const leavesContainer = document.querySelector('.leaves-container');

// backgroundAnimals removed as we are using CSS animations

// Loading Screen Elements
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progressBar');

function createFallingLeaves() {
    if (!leavesContainer) return;
    leavesContainer.innerHTML = '';

    // --- Leaves ---
    const leafCount = 30;

    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div'); // Changed back to div
        leaf.classList.add('leaf');

        // Randomize initial position (Relative to Container)
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.top = `${Math.random() * -20}%`; // Start slightly above

        // Randomize size
        const size = Math.random() * 20 + 20; // 20px to 40px
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;

        // Randomize animation duration and delay
        const duration = Math.random() * 5 + 8; // 8-13s
        const delay = Math.random() * 5;

        leaf.style.animationDuration = `${duration}s`;
        leaf.style.animationDelay = `${delay}s`;

        leavesContainer.appendChild(leaf);
    }
}

function createFireflies() {
    if (!fireflyContainer) return;
    fireflyContainer.innerHTML = '';

    const fireflyCount = 15; // Slightly fewer but larger/smarter

    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // Initial Position
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        firefly.style.left = `${startX}vw`;
        firefly.style.top = `${startY}vh`;

        // Randomize size (Larger as requested)
        const size = Math.random() * 10 + 5; // 5px to 15px
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;

        fireflyContainer.appendChild(firefly);

        // Start intelligent movement loop
        animateFirefly(firefly);
    }
}

function animateFirefly(firefly) {
    // 1. Pick a new random position
    const newX = Math.random() * 100;
    const newY = Math.random() * 100;

    // 2. Calculate distance to determine speed (constant speed)
    // We can just use a random duration for simplicity and "organic" feel
    const duration = Math.random() * 5 + 5; // 5-10 seconds to move

    // 3. Apply transition
    firefly.style.transitionDuration = `${duration}s`;
    firefly.style.left = `${newX}vw`;
    firefly.style.top = `${newY}vh`;

    // 4. Wait for movement to finish, then stay for a bit
    setTimeout(() => {
        // Stay duration
        const stayDuration = Math.random() * 3000 + 2000; // 2-5 seconds wait

        setTimeout(() => {
            // Loop again
            if (document.body.contains(firefly)) {
                animateFirefly(firefly);
            }
        }, stayDuration);

    }, duration * 1000);
}

// Replaces createBackgroundAnimals
function createBackgroundAnimals() {
    createFallingLeaves();
    createFireflies();
}

// PWA Status Elements
const pwaStatus = document.getElementById('pwa-status');

let assetsToLoad = [];
let loadedAssetsCount = 0;

// Audio Elements
const backgroundMusic = document.getElementById('backgroundMusic');
let levelClickSound = null; // Will be initialized as an Audio object later

function updateProgressBar() {
    const progress = (loadedAssetsCount / assetsToLoad.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.floor(progress)}%`;

    if (loadedAssetsCount === assetsToLoad.length) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden'); // Fade out
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none'; // Remove from flow after fade
                // Reveal game content
                document.querySelector('.firefly-container').classList.remove('d-none');
                document.querySelector('.leaves-container').classList.remove('d-none');
                document.querySelector('.level-selection-container').classList.remove('d-none');
            }, { once: true });
        }, 500); // Give a slight delay before hiding for better UX
    }
}

function loadAsset(url) {
    if (!url || typeof url !== 'string') {
        console.warn("Invalid asset URL:", url);
        return Promise.resolve(null);
    }
    // Check if it's an audio asset based on extension or explicit check
    if (url.endsWith('.mp3') || url.endsWith('.ogg') || url.endsWith('.wav') ||
        (window.GAME_CONFIG.audio && (url === window.GAME_CONFIG.audio.backgroundMusic || url === window.GAME_CONFIG.audio.levelClick))) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                loadedAssetsCount++;
                updateProgressBar();
                resolve(audio); // Resolve with the Audio object itself
            };
            audio.onerror = (e) => {
                console.warn(`Failed to load audio asset: ${url}`, e);
                loadedAssetsCount++; // Still increment to continue progress
                updateProgressBar();
                resolve(null); // Resolve even on error to not block loading
            };
            audio.src = url;
            audio.load(); // Request to load the audio
        });
    } else {
        // Handle image assets as before
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                loadedAssetsCount++;
                updateProgressBar();
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image asset: ${url}`);
                loadedAssetsCount++; // Still increment to continue progress
                updateProgressBar();
                resolve(null); // Resolve even on error to not block loading
            };
            img.src = url;
        });
    }
}

function collectAssets() {
    // Collect all level background images and animal heads
    for (const levelNum in window.LEVEL_CONFIG) {
        const levelData = window.LEVEL_CONFIG[levelNum];
        if (levelData.images) {
            if (levelData.images.background) {
                assetsToLoad.push(levelData.images.background);
            }
            if (levelData.images.animalHead) {
                assetsToLoad.push(levelData.images.animalHead);
            }
        }
    }
    // Add background music to assets to load
    if (window.GAME_CONFIG && window.GAME_CONFIG.audio) {
        if (window.GAME_CONFIG.audio.backgroundMusic) {
            assetsToLoad.push(window.GAME_CONFIG.audio.backgroundMusic);
        }
        if (window.GAME_CONFIG.audio.levelClick) { // Add click sound to assets to load
            assetsToLoad.push(window.GAME_CONFIG.audio.levelClick);
        }
    }
    console.log("Total assets to load:", assetsToLoad.length);
}

// Function to set and attempt to play background music
function setBackgroundMusic() {
    if (window.GAME_CONFIG && window.GAME_CONFIG.audio && window.GAME_CONFIG.audio.backgroundMusic) {
        backgroundMusic.src = window.GAME_CONFIG.audio.backgroundMusic;
        console.log("Attempting to set background music src:", backgroundMusic.src);

        backgroundMusic.addEventListener('canplaythrough', function handler() {
            backgroundMusic.removeEventListener('canplaythrough', handler);
            console.log("Background music `canplaythrough` event fired. Audio is ready.");
            backgroundMusic.play().catch(error => {
                console.warn("Autoplay of background music blocked (from canplaythrough):", error);
                console.warn("Please click anywhere on the page to start the music.");
            });
        }, { once: true });

        backgroundMusic.onerror = (e) => {
            console.error("Error loading background music:", e);
            // More detailed error logging for audio sources
            if (e.target && e.target.error) {
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED: console.error('Audio load aborted.'); break;
                    case e.target.error.MEDIA_ERR_NETWORK: console.error('Audio network error.'); break;
                    case e.target.error.MEDIA_ERR_DECODE: console.error('Audio decode error (corrupted or unsupported format).'); break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED: console.error('Audio source not supported.'); break;
                    default: console.error('Unknown audio error.'); break;
                }
            }
        };

    } else {
        console.warn("Background music path not found in GAME_CONFIG.");
    }
}

// Function to set up the level click sound
function setupLevelClickSound() {
    if (window.GAME_CONFIG && window.GAME_CONFIG.audio && window.GAME_CONFIG.audio.levelClick) {
        levelClickSound = new Audio(window.GAME_CONFIG.audio.levelClick);
        levelClickSound.preload = 'auto'; // Preload the audio
        levelClickSound.volume = 0.5; // Set a default volume, adjust as needed

        // Optional: Error logging for the click sound
        levelClickSound.onerror = (e) => {
            console.error("Error loading level click sound:", e);
        };
    } else {
        console.warn("Level click sound path not found in GAME_CONFIG.");
    }
}

// Function to play the level click sound
function playLevelClickSound() {
    if (levelClickSound) {
        // To allow multiple rapid clicks to play the sound,
        // we reset current time to 0 before playing.
        levelClickSound.currentTime = 0;
        levelClickSound.play().catch(error => {
            console.warn("Could not play level click sound:", error);
            // This might happen if the sound is played before user interaction,
            // or if multiple rapid clicks occur. Often ignorable for short SFX.
        });
    }
}


function setDynamicCSSVariables() {
    const root = document.documentElement.style;
    const indexConfig = window.GAME_CONFIG.indexPage;

    root.setProperty('--index-body-gradient-start', indexConfig.bodyGradientStart);
    root.setProperty('--index-body-gradient-end', indexConfig.bodyGradientEnd);
    root.setProperty('--index-panel-bg-color', indexConfig.panelBgColor);
    root.setProperty('--index-panel-shadow-color', indexConfig.panelShadowColor);

    root.setProperty('--index-level-node-gradient-start', indexConfig.levelNode.gradientStart);
    root.setProperty('--index-level-node-gradient-end', indexConfig.levelNode.gradientEnd);
    root.setProperty('--index-level-node-border-color', indexConfig.levelNode.borderColor);
    root.setProperty('--index-level-node-locked-gradient-start', indexConfig.levelNode.lockedGradientStart);
    root.setProperty('--index-level-node-locked-gradient-end', indexConfig.levelNode.lockedGradientEnd);
    root.setProperty('--index-level-node-locked-border-color', indexConfig.levelNode.lockedBorderColor);
    root.setProperty('--index-level-node-overlay-color', indexConfig.levelNode.overlayColor);

    root.setProperty('--index-complete-screen-bg-color', indexConfig.completeScreen.bgColor);
    root.setProperty('--index-complete-screen-title-color', indexConfig.completeScreen.titleColor);
    root.setProperty('--index-complete-screen-text-color', indexConfig.completeScreen.textColor);
    root.setProperty('--index-complete-button-next-bg', indexConfig.completeScreen.nextButtonBg);
    root.setProperty('--index-complete-button-next-hover', indexConfig.completeScreen.nextButtonHover);
    root.setProperty('--index-complete-button-home-bg', indexConfig.completeScreen.homeButtonBg);
    root.setProperty('--index-complete-button-home-hover', indexConfig.completeScreen.homeButtonHover);

    root.setProperty('--index-bg-animal-opacity', indexConfig.backgroundAnimals.opacity);
}

// function createLevelNode(levelNum, levelData, isLocked) {
//      const colDiv = document.createElement('div');
//     colDiv.classList.add('mb-4', 'd-flex', 'justify-content-center');

//     const node = document.createElement('div');
//     node.classList.add('level-node');
//     if (isLocked) {
//         node.classList.add('locked');
//     }
//     node.dataset.level = levelNum;
//     node.dataset.url = `play.html?level=${levelNum}`;

//     // Get stars earned for this level
//     const progress = JSON.parse(localStorage.getItem('gameProgress')) || {};
//     const starsEarned = progress.levelStars ? (progress.levelStars[levelNum] || 0) : 0;

//     // Create stars container
//     const starsContainer = document.createElement('div');
//     starsContainer.className = 'level-stars';

//     // Add star icons based on stars earned
//     // for (let i = 1; i <= 3; i++) {
//     //     const star = document.createElement('i');
//     //     star.className = `fas fa-star${i <= starsEarned ? '' : ' far'}`;
//     //     starsContainer.appendChild(star);
//     // }
//     for (let i = 1; i <= 3; i++) {
//     const star = document.createElement('img');
//     star.src = i <= starsEarned ? 'assets/icons/star-filled.png' : 'assets/icons/star-empty.png';
//     star.alt = i <= starsEarned ? 'Filled star' : 'Empty star';
//     star.width = 24;  // size in pixels
//     star.height = 24; // size in pixels
//     starsContainer.appendChild(star);
//     }

//     // Set background image
//     if (levelData && levelData.images && levelData.images.background) {
//         node.style.backgroundImage = `url('${levelData.images.background}')`;
//     } else {
//         node.style.backgroundImage = `linear-gradient(var(--index-level-node-overlay-color), linear-gradient(to right, var(--index-level-node-gradient-start), var(--index-level-node-gradient-end))`;
//     }

//     node.innerHTML = `
//         ${starsContainer.outerHTML}
//         <h2>${levelNum}</h2>
//         ${levelData.name ? `<span class="level-name">${levelData.name}</span>` : ''}
//         <span class="lock-icon"><img class="mb-1" src="assets/icons/lock.png" alt="lock icon" width="30" height="30"></span>
//     `;

//     // --- ADDED: Play click sound on level node click ---
//     node.addEventListener('click', () => {
//         if (!node.classList.contains('locked')) {
//             playLevelClickSound(); // Play the sound before navigating
//             // Give a tiny delay for sound to start before navigating
//             setTimeout(() => {
//                 window.location.href = node.dataset.url;
//             }, 100); // 100ms delay, adjust if sound is longer
//         } else {
//             // Optionally, play a 'locked' sound if you have one
//             // playLockedSound();
//             console.log(`Level ${levelNum} is locked.`);
//         }
//     });

//     colDiv.appendChild(node);
//     return colDiv;
// }

function createLevelNode(levelNum, levelData, isLocked) {
    const colDiv = document.createElement('div');
    // MODIFIED: Removed 'd-flex' and 'justify-content-center' to allow for random positioning
    colDiv.classList.add('mb-4', 'pt-4');

    const node = document.createElement('div');
    node.classList.add('level-node');
    if (isLocked) {
        node.classList.add('locked');
    }
    node.dataset.level = levelNum;
    node.dataset.url = `play.html?level=${levelNum}`;

    // Get stars earned for this level
    const progress = JSON.parse(localStorage.getItem('gameProgress')) || {
        unlockedLevels: 1,
        levelStars: {}
    };
    //     const starsEarned = progress.levelStars ? (progress.levelStars[levelNum] || 0) : 0;
    const starsEarned = progress.levelStars[levelNum] || 0;

    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'level-stars';

    // Add star icons based on stars earned
    // Always show 3 stars (filled or empty)
    for (let i = 1; i <= 3; i++) {
        const star = document.createElement('img');
        star.src = i <= starsEarned ? 'assets/icons/star-filled.png' : 'assets/icons/star-empty.png';
        star.alt = i <= starsEarned ? 'Filled star' : 'Empty star';
        star.width = 24;  // size in pixels
        star.height = 24; // size in pixels
        starsContainer.appendChild(star);
    }
    // Set background image - REMOVED to force brown styling as per user request
    // if (levelData && levelData.images && levelData.images.background) {
    //     node.style.backgroundImage = `url('${levelData.images.background}')`;
    // } else {
    //     node.style.backgroundImage = `linear-gradient(var(--index-level-node-overlay-color), linear-gradient(to right, var(--index-level-node-gradient-start), var(--index-level-node-gradient-end))`;
    // }
    // Create wrapper for star positioning
    const wrapper = document.createElement('div');
    wrapper.classList.add('level-node-wrapper');

    node.innerHTML = `
        <div class="level-content">
            <h2>${levelNum}</h2>
            <div class="level-name">${levelData.name || `Level ${levelNum}`}</div>
        </div>
        <span class="lock-icon"><img src="assets/icons/lock.png" alt="lock icon" width="30" height="30"></span>
    `;

    // --- NEW: Add a zigzag horizontal offset to the level node ---
    // Amplitude adjusted for mobile
    const isMobile = window.innerWidth < 768;
    const amplitude = isMobile ? 70 : 120;
    const frequency = 0.8;
    const xOffset = Math.sin(levelNum * frequency) * amplitude;
    wrapper.style.transform = `translateX(${xOffset}px)`;

    // --- ADDED: Play click sound on level node click ---
    node.addEventListener('click', () => {
        if (!node.classList.contains('locked')) {
            playLevelClickSound(); // Play the sound before navigating
            setTimeout(() => {
                window.location.href = node.dataset.url;
            }, 100);
        } else {
            // Shake animation for locked levels
            node.classList.add('shake-locked');
            setTimeout(() => node.classList.remove('shake-locked'), 500);
            console.log(`Level ${levelNum} is locked.`);
        }
    });

    // Append stars OUTSIDE the node but inside the wrapper
    wrapper.appendChild(starsContainer);
    wrapper.appendChild(node);

    colDiv.appendChild(wrapper);
    return colDiv;
}


function renderLevels() {
    levelRow.innerHTML = ''; // Clear existing nodes

    for (let i = totalLevels; i >= 1; i--) {
        const levelData = window.LEVEL_CONFIG[i];
        const isLocked = i > unlockedLevels; // Check if current level is unlocked
        if (levelData) {
            levelRow.appendChild(createLevelNode(i, levelData, isLocked));
        } else {
            console.warn(`Level configuration for level ${i} not found. Creating placeholder.`);
            const colDiv = document.createElement('div');
            colDiv.classList.add('mb-4', 'd-flex', 'justify-content-center');
            colDiv.innerHTML = `<div class="level-node locked"><h2>${i}</h2><span class="lock-icon"><i class="fas fa-exclamation-triangle"></i></span></div>`;
            levelRow.appendChild(colDiv);
        }
    }

    // Auto-scroll to current level
    setTimeout(() => {
        const currentUnlocked = parseInt(localStorage.getItem('unlockedLevels')) || 1;
        // Find the node for the current unlocked level
        const currentNode = document.querySelector(`.level-node[data-level="${currentUnlocked}"]`);

        if (currentNode) {
            currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 500); // Slight delay to ensure rendering
}

function createFallingLeaves() {
    console.log("Creating falling leaves...");
    if (!leavesContainer) {
        console.error("Leaves container not found!");
        return;
    }
    leavesContainer.innerHTML = '';

    // --- Leaves ---
    const leafCount = 30;

    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div'); // Changed back to div
        leaf.classList.add('leaf');

        // Randomize initial position (Relative to Container)
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.top = `${Math.random() * -20}%`; // Start slightly above

        // Randomize size
        const size = Math.random() * 20 + 20; // 20px to 40px
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;

        // Randomize animation duration and delay
        // Randomize animation duration and delay
        const duration = Math.random() * 5 + 8; // 8-13s
        const delay = Math.random() * duration;

        leaf.style.animationDuration = `${duration}s`;
        leaf.style.animationDelay = `-${delay}s`;

        leavesContainer.appendChild(leaf);
    }
    console.log(`Created ${leafCount} leaves.`);
}

function createFireflies() {
    console.log("Creating fireflies...");
    if (!fireflyContainer) {
        console.error("Firefly container not found!");
        return;
    }
    fireflyContainer.innerHTML = '';

    const fireflyCount = 15; // Slightly fewer but larger/smarter

    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // Initial Position
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        firefly.style.left = `${startX}vw`;
        firefly.style.top = `${startY}vh`;

        // Randomize size (Larger as requested)
        const size = Math.random() * 10 + 5; // 5px to 15px
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;

        fireflyContainer.appendChild(firefly);

        // Start intelligent movement loop
        animateFirefly(firefly);
    }
    console.log(`Created ${fireflyCount} fireflies.`);
}

function animateFirefly(firefly) {
    // 1. Pick a new random position
    const newX = Math.random() * 100;
    const newY = Math.random() * 100;

    // 2. Calculate distance to determine speed (constant speed)
    // We can just use a random duration for simplicity and "organic" feel
    const duration = Math.random() * 5 + 5; // 5-10 seconds to move

    // 3. Apply transition
    firefly.style.transitionDuration = `${duration}s`;
    firefly.style.left = `${newX}vw`;
    firefly.style.top = `${newY}vh`;

    // 4. Wait for movement to finish, then stay for a bit
    setTimeout(() => {
        // Stay duration
        const stayDuration = Math.random() * 3000 + 2000; // 2-5 seconds wait

        setTimeout(() => {
            // Loop again
            if (document.body.contains(firefly)) {
                animateFirefly(firefly);
            }
        }, stayDuration);

    }, duration * 1000);
}

// Replaces createBackgroundAnimals
function createBackgroundAnimals() {
    console.log("Initializing background animations...");
    createFallingLeaves();
    createFireflies();
}

function handleResize() {
    // No-op for now, CSS handles resizing
}
// Check for refresh flag in URL
if (window.location.search.includes('refresh')) {
    // Clear the refresh parameter from URL
    history.replaceState(null, null, window.location.pathname);
    // Force reload the levels
    checkLevels();
}
// The key used in localStorage to store the unlocked levels
const localStorageKey = 'hyperHuntUnlockedLevels';


function saveUnlockedLevels() {
    localStorage.setItem(localStorageKey, JSON.stringify(unlockedLevels));
    console.log('Unlocked levels saved:', unlockedLevels);
}

function checkLevels() {
    const levelNodes = document.querySelectorAll('.level-node');
    const unlocked = JSON.parse(localStorage.getItem('hyperHuntUnlockedLevels')) || [1];

    levelNodes.forEach(node => {
        const level = parseInt(node.dataset.level);
        if (unlocked.includes(level)) {
            node.classList.remove('locked');
            node.title = ''; // Clear any "locked" tooltip
            console.log(`Level ${level} is unlocked.`);
        } else {
            node.classList.add('locked');
            node.title = `Complete Level ${level - 1} to unlock`;
            console.log(`Level ${level} is locked.`);
        }
    });
}

// Function to simulate unlocking the next level after completion
function unlockNextLevel(completedLevel) {
    const nextLevel = completedLevel + 1;
    if (!unlockedLevels.includes(nextLevel)) {
        unlockedLevels.push(nextLevel);
        unlockedLevels.sort((a, b) => a - b);
        saveUnlockedLevels();
        checkLevels(); // Refresh the UI
        console.log(`Unlocked level ${nextLevel}`);
    }
}

// Function to reset all progress
function resetLevels() {
    if (confirm("Are you sure you want to reset all your progress?")) {
        unlockedLevels = [1];
        saveUnlockedLevels();
        checkLevels();
        alert("Game progress has been reset.");
        location.reload(); // Reload the page to show the changes
    }
}



// Initial check when the page loads
window.addEventListener('DOMContentLoaded', () => {
    checkLevels();
});




// Message handler for communication with play.html
window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'unlockedLevel') {
        // Add the unlocked level if not already present
        const unlocked = JSON.parse(localStorage.getItem('hyperHuntUnlockedLevels')) || [1];
        if (!unlocked.includes(data.level)) {
            unlocked.push(data.level);
            unlocked.sort((a, b) => a - b);
            localStorage.setItem('hyperHuntUnlockedLevels', JSON.stringify(unlocked));
            checkLevels(); // Update the UI immediately
        }
    }
});
// --- Navbar and Modal Logic ---
const navHome = document.getElementById('nav-home');
const navLeaderboard = document.getElementById('nav-leaderboard');
const navProfile = document.getElementById('nav-profile');
const leaderboardModal = document.getElementById('leaderboard-modal');
const profileModal = document.getElementById('profile-modal');
const closeLeaderboard = document.getElementById('close-leaderboard');
const closeProfile = document.getElementById('close-profile');
const leaderboardList = document.getElementById('leaderboard-list');
const profileNameInput = document.getElementById('profile-name-input');
const saveProfileBtn = document.getElementById('save-profile-btn');
const profilePicInput = document.getElementById('profile-pic-input');
const changePicBtn = document.getElementById('change-pic-btn');
const profilePicPreview = document.getElementById('profile-pic-preview');

// Navigation Event Listeners
if (navHome) {
    navHome.addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
        profileModal.style.display = 'none';
        setActiveNav(navHome);
    });
}

if (navLeaderboard) {
    navLeaderboard.addEventListener('click', () => {
        loadLeaderboard();
        leaderboardModal.style.display = 'flex';
        profileModal.style.display = 'none';
        setActiveNav(navLeaderboard);
    });
}

if (navProfile) {
    navProfile.addEventListener('click', () => {
        loadProfile();
        profileModal.style.display = 'flex';
        leaderboardModal.style.display = 'none';
        setActiveNav(navProfile);
    });
}

function setActiveNav(activeElement) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    activeElement.classList.add('active');
}

// Modal Close Listeners
if (closeLeaderboard) {
    closeLeaderboard.addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
        setActiveNav(navHome);
    });
}

if (closeProfile) {
    closeProfile.addEventListener('click', () => {
        profileModal.style.display = 'none';
        setActiveNav(navHome);
    });
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === leaderboardModal) {
        leaderboardModal.style.display = 'none';
        setActiveNav(navHome);
    }
    if (event.target === profileModal) {
        profileModal.style.display = 'none';
        setActiveNav(navHome);
    }
});

// --- Leaderboard Logic ---
function loadLeaderboard() {
    leaderboardList.innerHTML = '';

    // Get Current User Score
    const progress = JSON.parse(localStorage.getItem('gameProgress')) || { levelScores: {} };
    let totalScore = 0;
    if (progress.levelScores) {
        totalScore = Object.values(progress.levelScores).reduce((a, b) => a + b, 0);
    }

    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { name: "You", avatar: "assets/icons/user-default.png" };

    const currentUser = {
        name: userProfile.name,
        score: totalScore,
        avatar: userProfile.avatar,
        isCurrent: true
    };

    // Combine and Sort (Just current user for now as requested)
    let allUsers = [currentUser];
    // If we had other stored users, we would add them here.

    allUsers.sort((a, b) => b.score - a.score);

    // Render
    allUsers.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${user.isCurrent ? 'current-user' : ''}`;
        item.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <div class="user-info">
                <img src="${user.avatar}" class="user-avatar" onerror="this.src='assets/icons/user-default.png'">
                <span>${user.name}</span>
            </div>
            <span class="score">${user.score}</span>
        `;
        leaderboardList.appendChild(item);

        // Scroll to current user if they are far down (simple implementation)
        if (user.isCurrent && index > 4) {
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });
}

// --- Profile Logic ---
function loadProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { name: "", avatar: "assets/icons/user-default.png" };
    profileNameInput.value = userProfile.name;
    profilePicPreview.src = userProfile.avatar;
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        const name = profileNameInput.value.trim() || "Player";
        const avatar = profilePicPreview.src;

        const userProfile = { name, avatar };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        alert("Profile Saved!");
        profileModal.style.display = 'none';
        setActiveNav(navHome);
    });
}

if (changePicBtn) {
    changePicBtn.addEventListener('click', () => {
        profilePicInput.click();
    });
}

if (profilePicInput) {
    profilePicInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePicPreview.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

// animateBackgroundAnimals removed

function resetGameProgress() {
    if (confirm('Are you sure you want to reset all game progress? This will lock all levels except the first one.')) {
        unlockedLevels = 1;
        localStorage.setItem('unlockedLevels', unlockedLevels);
        renderLevels(); // Refresh the display
        alert('Game progress has been reset. Only Level 1 is now unlocked.');
    }
}


window.simulateLevelWin = function (completedLevel, starsEarned) {
    // --- FIX STARTS HERE ---
    // 1. Get the current game progress from localStorage
    const gameProgress = JSON.parse(localStorage.getItem('gameProgress')) || { levelStars: {} };

    // 2. Update the star count for the completed level
    gameProgress.levelStars[completedLevel] = starsEarned;

    // 3. Save the updated game progress back to localStorage
    localStorage.setItem('gameProgress', JSON.stringify(gameProgress));
    // --- FIX ENDS HERE ---

    // Only update unlocked levels if a new high score is achieved for a new level.
    if (completedLevel >= unlockedLevels) {
        // Don't unlock beyond total levels
        const newUnlocked = Math.min(completedLevel + 1, totalLevels);

        // Only update if we're actually unlocking something new
        if (newUnlocked > unlockedLevels) {
            unlockedLevels = newUnlocked;
            localStorage.setItem('unlockedLevels', unlockedLevels);
        }
    }

    completeMessage.textContent = `Level ${completedLevel} Complete!`;
    completeDetails.textContent = `Stars Earned: ${starsEarned || 0}/3`;
    levelCompleteScreen.style.display = 'flex';

    // Check if there's a next level to play
    const nextLevel = completedLevel + 1;
    if (nextLevel <= unlockedLevels && nextLevel <= totalLevels) {
        playNextLevelBtn.textContent = `Play Level ${nextLevel}`;
        playNextLevelBtn.onclick = () => {
            playLevelClickSound();
            setTimeout(() => {
                levelCompleteScreen.style.display = 'none';
                window.location.href = `play.html?level=${nextLevel}`;
            }, 100);
        };
        playNextLevelBtn.style.display = 'block';
    } else if (completedLevel >= totalLevels) {
        playNextLevelBtn.textContent = 'All Levels Completed!';
        playNextLevelBtn.onclick = null;
        playNextLevelBtn.style.display = 'none';
    } else {
        playNextLevelBtn.style.display = 'none';
    }

    backToHomeBtn.onclick = () => {
        playLevelClickSound();
        setTimeout(() => {
            levelCompleteScreen.style.display = 'none';
            renderLevels(); // Re-render to show any newly unlocked levels
        }, 100);
    };
};

// Function to update the PWA status message
function updatePWAStatus(online) {
    if (!pwaStatus) {
        console.warn("PWA status element not found. Please add a span with id='pwa-status' to your index.html.");
        return;
    }
    pwaStatus.textContent = online ? 'Online' : 'Offline';
    pwaStatus.classList.toggle('online', online);
    pwaStatus.classList.toggle('offline', !online);
}


// Initial setup when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (gameTitleElement) {
        if (window.GAME_CONFIG && window.GAME_CONFIG.gameName) {
            gameTitleElement.textContent = window.GAME_CONFIG.gameName;
        } else {
            gameTitleElement.textContent = "Precision Game"; // Fallback
        }
    }
    const faviconLink = document.getElementById('favicon-link');
    if (faviconLink && window.GAME_CONFIG && window.GAME_CONFIG.paths && window.GAME_CONFIG.paths.favicon) {
        faviconLink.href = window.GAME_CONFIG.paths.favicon;
    } else {
        console.warn("Favicon path not found in GAME_CONFIG or the HTML element is missing.");
    }

    setDynamicCSSVariables();
    collectAssets(); // Identify all assets to load

    // Start loading all assets concurrently
    if (assetsToLoad.length === 0) {
        console.log("No assets to load. Starting game immediately.");
        loadingScreen.style.display = 'none';
        renderLevels();
        createBackgroundAnimals();
        setBackgroundMusic();
    } else {
        Promise.all(assetsToLoad.map(url => loadAsset(url)))
            .then(loadedItems => {
                // After all assets are loaded, assign specific audio objects
                if (window.GAME_CONFIG && window.GAME_CONFIG.audio && window.GAME_CONFIG.audio.levelClick) {
                    const clickSoundPath = window.GAME_CONFIG.audio.levelClick;
                    // Find the Audio object that matches the click sound path
                    levelClickSound = loadedItems.find(item => item instanceof Audio && item.src.includes(clickSoundPath));
                    if (levelClickSound) {
                        levelClickSound.volume = 0.5; // Set volume for click sound
                    } else {
                        console.warn("Level click sound object not found after loading. Creating new Audio instance.");
                        levelClickSound = new Audio(clickSoundPath); // Fallback
                        levelClickSound.volume = 0.5;
                    }
                }

                renderLevels();
                createBackgroundAnimals();
                setBackgroundMusic(); // Play music after initial assets load and on DOM ready
            })
            .catch(error => {
                console.error("Error loading assets:", error);
                // Hide loading screen even on error
                loadingScreen.style.display = 'none';
                // Even if there's an error, try to show the game page
                renderLevels();
                createBackgroundAnimals();
                setBackgroundMusic(); // Still try to play music
            });
    }

    // --- PWA Service Worker Registration and Online/Offline Handling ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }

    // Set initial online/offline status
    updatePWAStatus(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', () => updatePWAStatus(true));
    window.addEventListener('offline', () => updatePWAStatus(false));
});

// Add a click listener to the document to try and play music
// This is a common workaround for browser autoplay policies
// This listener will act as the final fallback for user interaction
document.addEventListener('click', () => {
    if (backgroundMusic.paused && backgroundMusic.src) {
        backgroundMusic.play().then(() => {
            console.log("Background music started on user click.");
        }).catch(error => {
            console.warn("Background music play on user click still blocked:", error);
        });
    }
    // Also attempt to play click sound if it wasn't already allowed
    if (levelClickSound && levelClickSound.paused && levelClickSound.src) {
        levelClickSound.play().catch(error => {
            // This error is less critical for single SFX on first interaction
            // as subsequent plays should work.
        });
    }

}, { once: true }); // Only attempt to play once on the first user interaction

// Handle window resize for background animals (re-initialize their positions if needed)
window.addEventListener('resize', () => {
    // Re-create background animals on resize to ensure they fit new dimensions
    // This is a simpler approach than trying to adjust existing positions dynamically
    createBackgroundAnimals();
});
// const baseUrl = window.GAME_CONFIG.paths.baseUrl;

// To construct an image path for dynamic use in JS:
// const animalImagePath = baseUrl + levelConfig.images.animalHead; 

// To set an audio source dynamically:
// backgroundMusic.src = baseUrl + levelConfig.sounds.background; 
