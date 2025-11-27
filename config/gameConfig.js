// config/gameConfig.js
const GAME_CONFIG = {
    gameName: "Hyper Hunt",
    defaultChances: 10,
    defaultTimeLimit: 60,
    debugMode: false,
    indexPage: {
        bodyGradientStart: "#023e00", // Start color for the index page body background gradient
        bodyGradientEnd: "#527201",   // End color for the index page body background gradient
        panelBgColor: "rgba(255, 255, 255, 0.2)", // Background color for the level selection panel
        panelShadowColor: "rgba(0, 0, 0, 0.3)", // Shadow color for the level selection panel
        levelNode: {
            gradientStart: "#504f4e", // Start color for unlocked level node gradient
            gradientEnd: "#FFA500",   // End color for unlocked level node gradient
            borderColor: "#ffc927ff",   // Border color for unlocked level nodes
            lockedGradientStart: "#B0BEC5", // Start color for locked level node gradient (greyed out)
            lockedGradientEnd: "#78909C",   // End color for locked level node gradient
            lockedBorderColor: "#CFD8DC",   // Border color for locked level nodes
            overlayColor: "rgba(0, 0, 0, 0.3)" // Overlay color for level node background images
        },
        completeScreen: {
            bgColor: "rgba(0, 0, 0, 0.85)", // Background color for the level complete screen
            titleColor: "#FFD700",          // Title color for the level complete screen
            textColor: "#ffffff",           // Text color for the level complete screen
            nextButtonBg: "#4CAF50",        // Background color for the "Play Next Level" button
            nextButtonHover: "#45a049",     // Hover background color for "Play Next Level" button
            homeButtonBg: "#007bff",        // Background color for the "Back to Home" button
            homeButtonHover: "#0056b3"      // Hover background color for "Back to Home" button
        },
        backgroundAnimals: {
            count: 10,       // Number of animal heads floating in the background
            sizeMin: 50,     // Minimum size of background animal heads (pixels)
            sizeMax: 150,    // Maximum size of background animal heads (pixels)
            speedMin: 5,    // Minimum animation duration for background animals (seconds)
            speedMax: 10,    // Maximum animation duration for background animals (seconds)
            opacity: 0.2     // Opacity of background animal heads
        }
    },
    audio: {
        backgroundMusic: 'sounds/background.mp3',
        levelClick: 'sounds/click.mp3' // Make sure this line exists and is correct
    },
    paths: {
        baseUrl: "hyperhunt/", // Or "/hyperhunt/" if your app lives in that folder
        images: "images/",
        sounds: "sounds/",
        config: "config/",
        favicon: 'assets/icons/icon.png',
        assets: "assets/"
    },
};

// Make GAME_CONFIG available globally
window.GAME_CONFIG = GAME_CONFIG;