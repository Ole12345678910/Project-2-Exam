const apiUrl = "https://v2.api.noroff.dev/";

// Function to get the listing ID from the URL query parameters
function getListingIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('listingId');
}

// Function to fetch and display the listing details
async function fetchAndDisplayListing() {
  const listingId = getListingIdFromUrl(); // Get listingId from URL
  if (!listingId) {
    console.error("No listingId found in URL.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}auction/listings/${listingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing! Status: ${response.status}`);
    }

    const result = await response.json();
    const listing = result.data;

    if (listing && listing.title && listing.description && listing.endsAt && listing.media) {
      displayListing(listing);
    } else {
      console.error("Incomplete data received:", listing);
    }
  } catch (error) {
    console.error("Error fetching listing:", error);
  }
}

// Function to render the listing on the page
function displayListing(listing) {
  const listingContainer = document.getElementById("listing-container");

  const title = listing.title || "No title available";
  const description = listing.description || "No description available";
  const imageUrl = listing.media && listing.media.length > 0 ? listing.media[0].url : "default-image.jpg";
  const imageAlt = listing.media && listing.media.length > 0 ? listing.media[0].alt : "Image not available";
  const tags = listing.tags.length > 0 ? listing.tags.join(", ") : "No tags available";
  const endDate = listing.endsAt ? new Date(listing.endsAt).toLocaleString() : "End date not available";
  const bidsCount = listing._count?.bids || "No bids yet";

  const createdDate = listing.created ? new Date(listing.created).toLocaleString() : "Creation date not available";
  const updatedDate = listing.updated ? new Date(listing.updated).toLocaleString() : "Last update not available";

  listingContainer.innerHTML = `
    <h2>${title}</h2>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${imageAlt}" />
    <p><strong>Tags:</strong> ${tags}</p>
    <p><strong>Created:</strong> ${createdDate}</p>
    <p><strong>Last Updated:</strong> ${updatedDate}</p>
    <p><strong>Ends:</strong> ${endDate}</p>
    <p><strong>Bids:</strong> ${bidsCount}</p>
  `;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchAndDisplayListing);

async function placeBid(listingId, bidAmount) {
    const apiKey = localStorage.getItem('apiKey');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!apiKey || !accessToken) {
      alert("API key or access token is missing. Please set your API key first.");
      return;
    }
  
    // URL for the bid request
    const url = `https://v2.api.noroff.dev/auction/listings/${listingId}/bids`;
  
    // Request data with the bid amount
    const requestData = { amount: bidAmount };
  
    // Log the request data to verify the amount and headers
    console.log("Placing bid with data:", requestData);
    console.log("Request URL:", url);
    console.log("Headers:", {
      'Authorization': `Bearer ${accessToken}`,
      'X-Noroff-API-Key': apiKey
    });
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Noroff-API-Key': apiKey,
          'Content-Type': 'application/json'  // Add Content-Type header
        },
        body: JSON.stringify(requestData)
      });
  
      const responseData = await response.json();
  
      // Log the full response for debugging
      console.log("API Response:", responseData);
      
      // Check if the response is OK
      if (!response.ok) {
        console.error('Error placing bid:', responseData);
        alert(`Error: ${responseData.message || 'Failed to place bid'}`);
        return;
      }
  
      console.log('Bid placed successfully:', responseData);
      alert("Your bid has been placed successfully!");
    } catch (error) {
      console.error('Error placing bid:', error);
      alert("There was an error placing your bid. Please try again.");
    }
  }
  
  
// Add event listener to "Place Bid" button
document.getElementById('place-bid-btn').addEventListener('click', function() {
  const bidAmount = parseFloat(document.getElementById('bid-amount').value); // Get the bid amount from user input
  const listingId = getListingIdFromUrl(); // Get the listing ID from the URL

  if (!listingId) {
    console.error("Listing ID is missing.");
    alert("Listing ID is missing.");
    return;
  }

  if (!bidAmount || bidAmount <= 0) {
    console.error("Invalid bid amount.");
    alert("Please enter a valid bid amount.");
    return;
  }

  placeBid(listingId, bidAmount);  // Place the bid
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchAndDisplayListing);
