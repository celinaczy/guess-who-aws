document.addEventListener('DOMContentLoaded', function() {
    const gameSetup = document.getElementById('game-setup');
    const gameContent = document.getElementById('game-content');
    const startGameBtn = document.getElementById('start-game-btn');
    const seedInput = document.getElementById('seed-input');
    const gameBoard = document.getElementById('game-board');
    const mysteryCardElement = document.getElementById('mystery-card');

    let allCards = [];

    // This map links the category name from cards.json to a CSS class in game-style.css
    const categoryColors = {
        "Storage": "card-storage",
        "Compute": "card-compute",
        "Databases": "card-database",
        "Networking": "card-networking",
        "Security": "card-security",
        "Management & Governance": "card-management",
        "Application Integration": "card-integration",
        "Migration & Transfer": "card-migration"
        // Add other categories here if you expand cards.json
    };

    // --- Seeded Random Number Generator ---
    function createSeededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }

    // --- Helper function to convert any string to a numeric seed ---
    function stringToSeed(str) {
        let hash = 0;
        if (str.length === 0) {
            // Return a random number if the string is empty
            return Math.floor(Math.random() * 100000);
        }
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // --- Start Game Event Listener ---
    startGameBtn.addEventListener('click', () => {
        let seedValue = seedInput.value.trim();
        let seed;

        // If the input is empty, create a random seed and display it
        if (seedValue === '') {
            // Generate a random, shareable string
            seedValue = (Math.random() + 1).toString(36).substring(2);
            seedInput.value = seedValue;
        }

        // Convert the text value (new or user-provided) into a numeric seed
        seed = stringToSeed(seedValue);

        // Hide the setup screen and show the game
        gameSetup.classList.add('hidden');
        gameContent.classList.remove('hidden');

        // Initialize the game with the chosen seed
        initializeGame(seed);
    });

    function initializeGame(seed) {
        const seededRandom = createSeededRandom(seed);

        fetch('cards.json')
            .then(response => response.json())
            .then(data => {
                allCards = []; // Reset cards array
                for (const category in data) {
                    if (data.hasOwnProperty(category)) {
                        data[category].forEach(card => {
                            allCards.push({ ...card, category: category });
                        });
                    }
                }

                // Shuffle the cards using the seeded random function for a predictable order
                allCards.sort(() => 0.5 - seededRandom());

                const gameCards = allCards.slice(0, 24);

                // Also shuffle the game cards themselves for board layout
                gameCards.sort(() => 0.5 - seededRandom());

                populateBoard(gameCards);

                // Select a mystery card using the standard math random function
                const mysteryCardIndex = Math.floor(Math.random() * gameCards.length);
                const mysteryCard = gameCards[mysteryCardIndex];
                selectMysteryCard(mysteryCard);
            })
            .catch(error => {
                console.error("Error loading card data:", error);
                gameBoard.innerHTML = "<p class='text-white'>Could not load the game. Please try again.</p>";
            });
    }

    function populateBoard(cards) {
        gameBoard.innerHTML = ''; // Clear the board first
        cards.forEach(cardData => {
            const cardElement = document.createElement('div');
            // Get the color class from our map based on the card's category.
            const colorClass = categoryColors[cardData.category] || '';
            // Assign BOTH the base 'game-card' class and the specific color class.
            cardElement.className = `game-card ${colorClass}`;

            cardElement.innerHTML = `
                <button class="info-btn">i</button>
                <div class="card-body">
                    <img src="${cardData.logo}" alt="${cardData.name} Logo" class="card-logo" onerror="this.style.display='none'">
                    <h3 class="card-title">${cardData.name}</h3>
                    <h4 class="card-subtitle text-muted"><b>${cardData.category}</b></h4>
                </div>
            `;

            // Add click event listener to FLIP the card
            cardElement.addEventListener('click', (event) => {
                // Only flip if the info button wasn't the click target
                if (!event.target.classList.contains('info-btn')) {
                     cardElement.classList.toggle('flipped');
                }
            });

            // Add click event listener for the INFO button
            const infoBtn = cardElement.querySelector('.info-btn');
            infoBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // This is crucial to prevent the card from flipping

                // Populate and show the modal with this card's data
                const modalTitle = document.getElementById('infoModalLabel');
                const modalBody = document.querySelector('#infoModal .modal-body');
                const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));

                modalTitle.textContent = cardData.name;
                let featuresList = cardData.features.map(feature => `<li>${feature}</li>`).join('');
                modalBody.innerHTML = `<ul>${featuresList}</ul>`;

                infoModal.show();
            });

            gameBoard.appendChild(cardElement);
        });
    }

    function selectMysteryCard(mysteryCard) {
        const mysteryCardBody = mysteryCardElement.querySelector('.card-body');
        mysteryCardBody.innerHTML = '<h3 class="card-title-mystery">?</h3>';

        // Initially, the card shows a question mark
        mysteryCardBody.innerHTML = '<h3 class="card-title">?</h3>';

        // Add a click event to reveal the mystery card
        mysteryCardElement.addEventListener('click', () => {
            mysteryCardElement.classList.add('revealed');
            const colorClass = categoryColors[mysteryCard.category] || '';
            mysteryCardElement.className = `game-card ${colorClass}`;

            mysteryCardBody.innerHTML = `
                <button class="info-btn">i</button>
                <img src="${mysteryCard.logo}" alt="${mysteryCard.name} Logo" class="card-logo" onerror="this.style.display='none'">
                <h3 class="card-title">${mysteryCard.name}</h3>
                <h4 class="card-subtitle text-muted"><b>${mysteryCard.category}</b></h4>
            `;

            // **FIX:** Add a new event listener to the info button that was just created.
            const infoBtn = mysteryCardBody.querySelector('.info-btn');
            infoBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent any other click events

                // Populate and show the modal with the mystery card's data
                const modalTitle = document.getElementById('infoModalLabel');
                const modalBody = document.querySelector('#infoModal .modal-body');
                const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));

                modalTitle.textContent = mysteryCard.name;
                let featuresList = mysteryCard.features.map(feature => `<li>${feature}</li>`).join('');
                modalBody.innerHTML = `<ul>${featuresList}</ul>`;

                infoModal.show();
            });

        }, { once: true }); // The event listener will only run once to reveal the card
    }
});
