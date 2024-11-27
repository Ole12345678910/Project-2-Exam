const apiUrl = "https://v2.api.noroff.dev/";

// Function to fetch auction listings
async function fetchAuctionListings() {
  try {
    const response = await fetch(`${apiUrl}auction/listings`);
    
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log("API Response:", data); // Log the data to verify it's fetched correctly

    // Call display function to render the listings on the webpage
    displayListings(data.data); // Access 'data' key which contains the array of listings
    
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
  }
}

// Function to display auction listings in the HTML
function displayListings(listings) {
  const listingsContainer = document.getElementById('listings-container');
  
  // Clear previous listings
  listingsContainer.innerHTML = '';
  
  // If listings is not an array, log the structure
  if (!Array.isArray(listings)) {
    console.error('Expected an array of listings, but got:', listings);
    return;
  }

  // Loop over each listing and create HTML elements for each one
  listings.forEach(listing => {
    const listingElement = document.createElement('div');
    listingElement.classList.add('listing');
    
    // Create image element
    const imageElement = document.createElement('img');
    imageElement.src = listing.media[0]?.url; // Use the first image URL from the media array
    imageElement.alt = listing.media[0]?.alt || "Item image"; // Use alt text for the image

    // Create title element
    const titleElement = document.createElement('h3');
    titleElement.textContent = listing.title;

    // Create description element
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = listing.description;

    // Create tags element
    const tagsElement = document.createElement('div');
    tagsElement.classList.add('tags');
    tagsElement.textContent = listing.tags.join(', ');

    // Append all elements to the listing element
    listingElement.appendChild(imageElement);
    listingElement.appendChild(titleElement);
    listingElement.appendChild(descriptionElement);
    listingElement.appendChild(tagsElement);

    // Append the listing element to the container
    listingsContainer.appendChild(listingElement);
  });
}

// Call the function to fetch auction listings when the page loads
fetchAuctionListings();
