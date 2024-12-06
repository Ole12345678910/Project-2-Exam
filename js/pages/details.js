import { apiKey, apiUrl } from "../constants/config.js";
import { 
  updateUserIcon, 
  renderAuctionEndedMessage, 
  displayUserCredits 
} from "../modules/utilit.js";
import { displayListing, displayBids, fetchAndDisplayListing } from "./listings.js";
import { placeBid } from "../modules/api.js";
import { initializeSearch  } from "../modules/search.js";
import { handleAuthButtons } from "../auth/logout.js";

// Get the listing ID from the URL query parameters


// Check if the auction has ended
export function hasAuctionEnded(endsAt) {
  const currentDate = new Date();
  const endDate = new Date(endsAt);
  return currentDate >= endDate;
}



// Fetch listing details
export async function fetchListingDetails(listingId) {
  const response = await fetch(`${apiUrl}auction/listings/${listingId}?_bids=true`);
  if (!response.ok) {
    throw new Error(`Failed to fetch listing! Status: ${response.status}`);
  }
  const result = await response.json();
  return result.data;
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

      await placeBid(listingId, bidAmount, accessToken);
      alert("Your bid has been placed successfully!");
      fetchAndDisplayListing(listingId); // Refresh listing details
    } catch (error) {
      handleErrorInBidSubmission(error);
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

// Place the bid by making an API call


// Handle errors during bid submission
function handleErrorInBidSubmission(error) {
  console.error("Error placing bid:", error);
  alert("There was an error placing your bid. Please try again.");
}

// Update user credits display
function updateUserCreditsDisplay(updatedCredits) {
  const userCreditsHeader = document.getElementById("user-credits-header");
  if (userCreditsHeader) {
    userCreditsHeader.textContent = `Credits: ${updatedCredits}`;
  }
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

