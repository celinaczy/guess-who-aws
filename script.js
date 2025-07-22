// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {

    // Define the mapping of category names to CSS color classes
    const categoryColors = {
        "Storage": "card-storage",
        "Compute": "card-compute",
        "Databases": "card-database",
        "Networking": "card-networking",
        "Application Integration": "card-integration",
        "Migration & Transfer": "card-migration",
        "Security": "card-security",
        "Management & Governance": "card-management"
    };

    const cardsContainer = document.getElementById('cards-container');

    // Fetch the JSON data from the file
    fetch('new-cards.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Loop through each category in the data (e.g., "Storage", "Compute")
            for (const category in data) {
                if (data.hasOwnProperty(category)) {
                    // Create the HTML for the category title
                    let categoryHtml = `<h2 class="category-title">${category}</h2>`;

                    // Start the row for the cards in this category
                    let cardsHtml = '<div class="row g-4">';

                    // Loop through each card object in the current category
                    data[category].forEach(card => {
                        // Build the list of features for the card
                        let featuresList = card.features.map(feature => `<li>${feature}</li>`).join('');

                        // Get the color class for the current category
                        let colorClass = categoryColors[category] || '';

                        // Create the full HTML for a single card
                        cardsHtml += `
                            <div class="col-lg-4 col-md-6">
                                <div class="card ${colorClass}">
                                    <div class="card-body">
                                        <h3 class="card-title">${card.name}</h3>
                                        <h5 class="card-subtitle mb-2 text-muted"><b>${category}</b></h5>
                                        <div class="card-text">
                                            <ul>${featuresList}</ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    // Close the row div
                    cardsHtml += '</div>';

                    // Append the category title and its cards to the main container
                    cardsContainer.innerHTML += categoryHtml + cardsHtml;
                }
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            cardsContainer.innerHTML = '<p class="text-center text-danger">Could not load card data. Please make sure the cards.json file is in the same directory.</p>';
        });
});
