document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('game-board');
    const mysteryCardElement = document.getElementById('mystery-card');
    let allCards = [];

    // Fetch the JSON data
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            // Flatten the data into a single array of cards
            for (const category in data) {
                data[category].forEach(card => {
                    allCards.push({ ...card, category: category });
                });
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
            cardElement.className = 'game-card';

            cardElement.innerHTML = `
                <div class="card-body">
                    <h3 class="card-title">${cardData.name}</h3>
                    <h4 class="card-subtitle text-muted"><b>${cardData.category}</b></h4>
                </div>
            `;

            // Add click event listener to flip the card
            cardElement.addEventListener('click', () => {
                cardElement.classList.toggle('flipped');
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
            mysteryCardBody.innerHTML = `
                <h3 class="card-title">${mysteryCard.name}</h3>
                <h4 class="card-subtitle text-muted"><b>${mysteryCard.category}</b></h4>
            `;
        }, { once: true }); // The event listener will only run once
    }
});
