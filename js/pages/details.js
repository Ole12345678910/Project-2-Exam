import { apiUrl, apiKey } from "../constants/config.js";
import { 
  updateUserIcon, 
  displayUserCredits,
  initMobileMenu 
} from "../modules/utilit.js";
import { placeBid } from "../modules/api.js";
import { initializeSearch  } from "../modules/search.js";
import { handleAuthButtons } from "../auth/logout.js";
import { accessToken } from "./listings.js";
import { displayListing } from "./listings.js";

// Move the error handler function to the top of the file
function handleErrorInBidSubmission(error) {
  console.error("Error placing bid:", error);
  alert("There was an error placing your bid. Please try again.");
}

initMobileMenu();


// Fetch listing details
// Fetch listing details based on listingId
export async function fetchListingDetails(listingId) {
  const response = await fetch(`${apiUrl}auction/listings/${listingId}?_bids=true`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Noroff-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch listing! Status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;  // Assuming your API returns an object with a `data` property
}

// Handle errors when fetching or displaying the bid form
export function handleErrorInBidForm(error, container) {
  console.error("Error fetching listing:", error);
  container.innerHTML = `<p>Error loading auction details. Please try again later.</p>`;
}

// Set up bid submission handler
export function setupBidSubmissionHandler(listingId, listing) {
  const placeBidForm = document.getElementById("place-bid-form");
  placeBidForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const bidAmount = getBidAmount();
    if (!validateBidAmount(bidAmount)) {
      alert("Please enter a valid bid amount between 1 and 1000.");
      return;
    }
    const accessToken = getAccessToken();
    if (!accessToken) {
      alert("You must be logged in to place a bid.");
      return;
    }
    try {
      const currentHighestBid = getCurrentHighestBid(listing);
      if (!isBidHigherThanCurrent(bidAmount, currentHighestBid)) {
        alert(`Your bid must be higher than the current bid of ${currentHighestBid}.`);
        return;
      }
      await placeBid(listingId, bidAmount, accessToken); // This will trigger the API call to place the bid
      alert("Your bid has been placed successfully!");
      fetchAndDisplayListing(listingId); // Refresh listing details
    } catch (error) {
      handleErrorInBidSubmission(error);  // Ensure this is used correctly
    }
  });
}


// Get bid amount from input field
function getBidAmount() {
  return parseFloat(document.getElementById("bid-amount").value.trim());
}

// Validate the entered bid amount
function validateBidAmount(amount) {
  return !isNaN(amount) && amount >= 1 && amount <= 1000;
}

// Get the access token from localStorage
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Get the current highest bid from the listing
function getCurrentHighestBid(listing) {
  return listing.bids && listing.bids.length > 0
    ? Math.max(...listing.bids.map(bid => bid.amount))
    : 0;
}

// Check if the entered bid is higher than the current highest bid
function isBidHigherThanCurrent(bidAmount, currentHighestBid) {
  return bidAmount > currentHighestBid;
}

// Update user credits display
function updateUserCreditsDisplay(updatedCredits) {
  const userCreditsHeader = document.getElementById("user-credits-header");
  if (userCreditsHeader) {
    userCreditsHeader.textContent = `Credits: ${updatedCredits}`;
  }
}



// Display the bid form for a specific listing
async function displayBidForm() {
  const bidFormContainer = document.getElementById("bid-form-container");
  const listingId = getListingIdFromUrl();

  try {
    const listing = await fetchListingDetails(listingId);

    if (hasAuctionEnded(listing.endsAt)) {
      displayAuctionEndedMessage(bidFormContainer);
      return;
    }

    renderBidForm(bidFormContainer);
    setupBidSubmissionHandler(listingId, listing);
  } catch (error) {
    handleErrorInBidForm(error, bidFormContainer);
  }


}

// Render the bid form for active auctions
export function renderBidForm(container) {
  container.innerHTML = `
    <form id="place-bid-form">
      <label for="bid-amount">Enter your bid amount:</label>
      <input type="number" id="bid-amount" name="bid-amount" required min="1" step="any" />
      <button class="bg-RoyalBlue p-2 text-white" type="submit">Place Bid</button>
    </form>
  `;
}


export function hasAuctionEnded(endsAt) {
  const currentDate = new Date();
  const endDate = new Date(endsAt);
  return currentDate >= endDate;
}

// Display message when auction has ended
export function displayAuctionEndedMessage(container) {
  container.innerHTML = `
    <p>The auction for this listing has ended. Bidding is no longer available.</p>
  `;
}

function showLoginPrompt() {
  const bidsContainer = document.getElementById("bids-container");
  bidsContainer.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-center">
      <p class="text-yellow-700 text-lg">Log in to view the bids for this listing.</p>
      <a href="/templates/auth/login.html" class="text-yellow-600 hover:text-yellow-800">Click here to log in</a>
    </div>
  `;
}

// Display bids for the listing

function getListingIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("listingId");
}

export async function fetchAndDisplayListing() {
  const listingId = getListingIdFromUrl(); // Get listingId from URL
  
  // Check if listingId exists, and if not, log an error and return early
  if (!listingId) {
    return;
  }

  try {
    const listingUrl = `${apiUrl}auction/listings/${listingId}?_bids=true&_seller=true`;


    const response = await fetch(listingUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing! Status: ${response.status}`);
    }

    const result = await response.json();
    const listing = result.data;

    // Only proceed if the listing data is complete
    if (listing && listing.title && listing.description && listing.endsAt && listing.media) {
      displayListing(listing);

      // Check if user is logged in to decide whether to display bids or a login button
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        displayBids(listing); // Display bids
        displayBidForm(); // Display bidding bar
      } else {
        showLoginPrompt(); // Display login prompt
      }
    } else {
      console.error("Incomplete data received:", listing);
    }
  } catch (error) {
    console.error("Error fetching listing:", error);
  }
}

export function displayBids(listing) {
  const bidsContainer = document.getElementById("bids-container");

  if (!listing.bids || listing.bids.length === 0) {
    bidsContainer.innerHTML = "<p>No bids placed yet for this listing.</p>";
    return;
  }

  const sortedBids = [...listing.bids].sort((a, b) => b.amount - a.amount);
  let displayedBidsCount = 3; // Number of bids currently displayed

  // Function to create a single bid element
  function createBidElement(bid) {
    const bidElement = document.createElement("div");
    bidElement.classList.add("bid-item");
    bidElement.innerHTML = `
      <div class="bg-white p-6 shadow-md mb-6">
        <p class="text-lg font-semibold text-gray-800"><strong>Bid Amount:</strong> ${bid.amount}</p>
        <p class="text-sm text-gray-600"><strong>Bidder:</strong> ${bid.bidder?.name || "Anonymous"}</p>
        <p class="text-sm text-gray-500"><strong>Placed on:</strong> ${new Date(bid.created).toLocaleString()}</p>
      </div>
    `;
    return bidElement;
  }

  // Function to create the toggle button
  function createToggleButton() {
    const toggleButton = document.createElement("button");
    const remainingBids = sortedBids.length - displayedBidsCount;

    toggleButton.textContent =
      remainingBids > 0
        ? `See More Bids (${Math.min(remainingBids, 3)} more)`
        : "Show Less";
    toggleButton.classList.add(
      "toggle-btn",
      "bg-RoyalBlue",
      "text-white",
      "py-2",
      "px-4",
      "rounded",
      "hover:bg-blue-700"
    );

    toggleButton.addEventListener("click", () => {
      if (remainingBids > 0) {
        displayedBidsCount = Math.min(
          displayedBidsCount + 3,
          sortedBids.length
        );
      } else {
        displayedBidsCount = 3; // Reset to show the initial 3 bids
      }
      renderBids();
    });

    return toggleButton;
  }

  // Function to render bids and the toggle button
  function renderBids() {
    bidsContainer.innerHTML = ""; // Clear previous content

    const bidsToDisplay = sortedBids.slice(0, displayedBidsCount);
    bidsToDisplay.forEach((bid) => {
      const bidElement = createBidElement(bid);
      bidsContainer.appendChild(bidElement);
    });

    // Add the toggle button only if there are more than 3 bids
    if (sortedBids.length > 3) {
      const toggleButton = createToggleButton();
      bidsContainer.appendChild(toggleButton);
    }
  }

  renderBids(); // Initial render
}


// Initialize UI updates and fetch listing details
displayUserCredits();
updateUserIcon();
document.addEventListener("DOMContentLoaded", () => {
  const userCredits = localStorage.getItem("userCredits") || "0";
  updateUserCreditsDisplay(parseFloat(userCredits));
  fetchAndDisplayListing();
});
handleAuthButtons();

document.addEventListener("DOMContentLoaded", () => {
  initializeSearch("search-bar", "search-btn", "dropdown-container", "dropdown-list");
});
