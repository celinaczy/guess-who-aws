document.addEventListener('DOMContentLoaded', function() {
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

    // Fetch the JSON data
    fetch('cards.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Flatten the data into a single array of cards, adding the category to each card object
            for (const category in data) {
                if (data.hasOwnProperty(category)) {
                    data[category].forEach(card => {
                        allCards.push({ ...card, category: category });
                    });
                }
            }

            // Shuffle the cards for a random layout each time
            allCards.sort(() => 0.5 - Math.random());

            // Limit the number of cards to 24 for the game board
            const gameCards = allCards.slice(0, 24);

            // Populate the game board with the 24 cards
            populateBoard(gameCards);

            // Select a mystery card from the same set of 24
            selectMysteryCard(gameCards);
        })
        .catch(error => {
            console.error("Error loading card data:", error);
            gameBoard.innerHTML = "<p class='text-white'>Could not load the game. Please try again.</p>";
        });

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

    function selectMysteryCard(cards) {
        // Select a random card from the array
        const mysteryCard = cards[Math.floor(Math.random() * cards.length)];
        const mysteryCardBody = mysteryCardElement.querySelector('.card-body');

        // Initially, the card shows a question mark
        mysteryCardBody.innerHTML = '<h3 class="card-title">?</h3>';

        // Add a click event to reveal the mystery card
        mysteryCardElement.addEventListener('click', () => {
            mysteryCardElement.classList.add('revealed');
            const colorClass = categoryColors[mysteryCard.category] || '';
            mysteryCardElement.className = `game-card ${colorClass}`; // Also color the mystery card when revealed

            mysteryCardBody.innerHTML = `
                <img src="${mysteryCard.logo}" alt="${mysteryCard.name} Logo" class="card-logo" onerror="this.style.display='none'">
                <h3 class="card-title">${mysteryCard.name}</h3>
                <h4 class="card-subtitle text-muted"><b>${mysteryCard.category}</b></h4>
            `;
        }, { once: true }); // The event listener will only run once
    }
});
