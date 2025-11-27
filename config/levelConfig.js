const LEVEL_CONFIG = {
    // Level 1 - Forest Oasis
    1: {
        name: "Forest Oasis",
        animalsToCatch: 3,
        animalSpeed: 2,
        timeLimit: 60,
        chances: 10,
        images: {
            background: 'images/bg_1.png',
            mobileBackground: 'images/mobile_1.png',
            bodyBackground: 'images/body_1.png',
            animal: 'images/rabbit_head.png',
            fullAnimal: 'images/full_rabbit.png',
            animalHead: 'images/rabbit_head.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#03440e',       // Dark background for general elements/overlays
            textColor: '#fffefeff',     // Light text for readability
            secColor: '#4CAF50',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },

    
    // Level 2 - Desert Dash
    2: {
        name: "Desert Dash",
        animalsToCatch: 5,
        animalSpeed: 3,
        timeLimit: 45,
        chances: 8,
        images: {
            background: 'images/bg_2.png',
            mobileBackground: 'images/mobile_2.png',
            bodyBackground: 'images/body_2.png',
            animal: 'images/head_2.png',
            fullAnimal: 'images/full_2.png',
            animalHead: 'images/head_2.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#b66e34',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#daa555',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 3 - Arctic Chase
    3: {
        name: "Arctic Chase",
        animalsToCatch: 4,
        animalSpeed: 2.5,
        timeLimit: 50,
        chances: 9,
        images: {
            background: 'images/bg_3.png',
            mobileBackground: 'images/mobile_3.png',
            bodyBackground: 'images/body_3.png',
            animal: 'images/head_3.png',
            fullAnimal: 'images/full_3.png',
            animalHead: 'images/head_3.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#0e617a',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#49c6e1',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 4 - Star Drift
    4: {
        name: "Star Drift",
        animalsToCatch: 6,
        animalSpeed: 3.5,
        timeLimit: 40,
        chances: 7,
        images: {
            background: 'images/bg_4.png',
            mobileBackground: 'images/mobile_4.png',
            bodyBackground: 'images/body_4.png',
            animal: 'images/head_4.png',
            fullAnimal: 'images/full_4.png',
            animalHead: 'images/head_4.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#081527',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#074192',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 5 - Volcanic Peak
    5: {
        name: "Volcanic Peak",
        animalsToCatch: 4,
        animalSpeed: 4,
        timeLimit: 55,
        chances: 8,
        images: {
            background: 'images/bg_5.png',
            mobileBackground: 'images/mobile_5.png',
            bodyBackground: 'images/body_5.png',
            animal: 'images/head_5.png',
            fullAnimal: 'images/full_5.png',
            animalHead: 'images/head_5.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#320e13',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#d62f14',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 6 - Arctic Tundra
    6: {
        name: "Arctic Tundra",
        animalsToCatch: 5,
        animalSpeed: 2.8,
        timeLimit: 65,
        chances: 7,
        images: {
            background: 'images/bg_6.png',
            mobileBackground: 'images/mobile_6.png',
            bodyBackground: 'images/body_6.png',
            animal: 'images/head_6.png',
            fullAnimal: 'images/full_6.png',
            animalHead: 'images/head_6.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#5198d1',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#5198d1',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 7 - Faerie Glade
    7: {
        name: "Faerie Glade",
        animalsToCatch: 7,
        animalSpeed: 3.2,
        timeLimit: 70,
        chances: 6,
        images: {
            background: 'images/bg_7.png',
            mobileBackground: 'images/mobile_7.png',
            bodyBackground: 'images/body_7.png',
            animal: 'images/head_7.png',
            fullAnimal: 'images/full_7.png',
            animalHead: 'images/head_7.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#083006',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#127a0d',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 8 - Cyberpunk City
    8: {
        name: "Cyberpunk City",
        animalsToCatch: 4,
        animalSpeed: 4.5,
        timeLimit: 50,
        chances: 9,
        images: {
            background: 'images/bg_8.png',
            mobileBackground: 'images/mobile_8.png',
            bodyBackground: 'images/body_8.png',
            animal: 'images/head_8.png',
            fullAnimal: 'images/full_8.png',
            animalHead: 'images/head_8.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#801172',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#b03aa1',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 9 - Stone Whisper
    9: {
        name: "Stone Whisper",
        animalsToCatch: 8,
        animalSpeed: 2.2,
        timeLimit: 80,
        chances: 5,
        images: {
            background: 'images/bg_9.png',
            mobileBackground: 'images/mobile_9.png',
            bodyBackground: 'images/body_9.png',
            animal: 'images/head_9.png',
            fullAnimal: 'images/full_9.png',
            animalHead: 'images/head_9.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#3d241a',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#8c5d3c',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 10 - Coral Spire
    10: {
        name: "Coral Spire",
        animalsToCatch: 6,
        animalSpeed: 5,
        timeLimit: 90,
        chances: 4,
        images: {
            background: 'images/bg_10.png',
            mobileBackground: 'images/mobile_10.png',
            bodyBackground: 'images/body_3.png',
            animal: 'images/head_10.png',
            fullAnimal: 'images/full_10.png',
            animalHead: 'images/head_10.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#0e617a',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#49c6e1',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 11 - Haunted Forest
    11: {
        name: "Haunted Forest",
        animalsToCatch: 5,
        animalSpeed: 3.8,
        timeLimit: 75,
        chances: 6,
        images: {
            background: 'images/bg_11.png',
            mobileBackground: 'images/mobile_11.png',
            bodyBackground: 'images/body_11.png',
            animal: 'images/head_11.png',
            fullAnimal: 'images/full_11.png',
            animalHead: 'images/head_11.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#1c0b0b',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#833306',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    },
    
    // Level 12 - Astral Shoal
    12: {
        name: "Astral Shoal",
        animalsToCatch: 10,
        animalSpeed: 4.2,
        timeLimit: 120,
        chances: 3,
        images: {
            background: 'images/bg_12.png',
            mobileBackground: 'images/mobile_12.png',
            bodyBackground: 'images/body_12.png',
            animal: 'images/head_12.png',
            fullAnimal: 'images/full_12.png',
            animalHead: 'images/head_12.png'
        },
        sounds: {
            background: 'sounds/background.mp3',
            click: 'sounds/click.mp3',
            taunt: 'sounds/taunt.mp3',
            catch: 'sounds/pop.mp3'
        },
         taunts: {
            onmiss: [
                "You missed me!",
                "Too slow!",
                "Better luck next time!"
            ],
            onhide: [
                "You'll never find me now!",
                "I'm hiding!",
                "Try and catch me!"
            ],
            random: [
                "Can you even see me?",
                "I'm over here!",
                "You're not very good at this!"
            ]
        },
        colors: {
            bgColor: '#08213b',       // Dark background for general elements/overlays
            textColor: '#ffffffff',     // Light text for readability
            secColor: '#18317a',      // Primary accent color (e.g., buttons, borders, scores)
            dangerColor: '#FF0000',   // Color for critical states (e.g., low timer)
            warningColor: '#FFA500'   // Color for warning states (e.g., medium timer)
        }
    }
};

// Make available globally
window.LEVEL_CONFIG = LEVEL_CONFIG;