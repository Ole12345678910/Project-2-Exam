import { apiUrl, apiKey } from "../constants/config.js";
import {
  updateUserIcon,
  displayUserCredits,
  initMobileMenu,
} from "../modules/utilit.js";
import { placeBid, fetchUserCreditsApi } from "../modules/api.js";
import { initializeSearch } from "../modules/search.js";
import { handleAuthButtons } from "../auth/logout.js";
import { accessToken, displayDetailsListing } from "./listings.js";
import { renderBidForm } from "../modules/utilit.js";

// Move the error handler function to the top of the file for clarity
function handleErrorInBidSubmission(error) {
  console.error("Error placing bid:", error);
  alert("There was an error placing your bid. Please try again.");
}

initMobileMenu(); // Initialize the mobile menu

// Fetch listing details based on listingId
export async function fetchListingDetails(listingId) {
  try {
    const response = await fetch(
      `${apiUrl}auction/listings/${listingId}?_bids=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch listing! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.data; // Return data from the API
  } catch (error) {
    console.error("Error fetching listing details:", error);
    throw error; // Rethrow the error for further handling
  }
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
        alert(
          `Your bid must be higher than the current bid of ${currentHighestBid}.`
        );
        return;
      }

      await placeBid(listingId, bidAmount, accessToken);
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
    ? Math.max(...listing.bids.map((bid) => bid.amount))
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

// Show login prompt if user is not logged in
function showLoginPrompt() {
  const bidsContainer = document.getElementById("bids-container");
  bidsContainer.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-center">
      <p class="text-yellow-700 text-lg">Log in to view the bids for this listing.</p>
      <a href="/templates/auth/login.html" class="text-yellow-600 hover:text-yellow-800">Click here to log in</a>
    </div>
  `;
}

// Get listingId from URL parameters
function getListingIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("listingId");
}

// Fetch and display the listing
export async function fetchAndDisplayListing() {
  const listingId = getListingIdFromUrl();
  if (!listingId) {
    return; // Early return if listingId is not available
  }

  try {
    const listingUrl = `${apiUrl}auction/listings/${listingId}?_bids=true&_seller=true`;

    const response = await fetch(listingUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing! Status: ${response.status}`);
    }

    const result = await response.json();
    const listing = result.data;

    // Ensure complete listing data before displaying
    if (listing && listing.title && listing.description && listing.endsAt && listing.media) {
      displayDetailsListing(listing);

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        displayBids(listing); // Display bids
        displayBidForm(); // Display bid form
      } else {
        showLoginPrompt(); // Show login prompt if not logged in
      }
    } else {
      console.error("Incomplete data received:", listing);
    }
  } catch (error) {
    console.error("Error fetching listing:", error);
  }
}

// Display bids for the listing
export function displayBids(listing) {
  const bidsContainer = document.getElementById("bids-container");

  if (!listing.bids || listing.bids.length === 0) {
    bidsContainer.innerHTML = "<p>No bids placed yet for this listing.</p>";
    return;
  }

  const sortedBids = [...listing.bids].sort((a, b) => b.amount - a.amount);
  let displayedBidsCount = 3;

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

  function createToggleButton() {
    const toggleButton = document.createElement("button");
    const remainingBids = sortedBids.length - displayedBidsCount;

    toggleButton.textContent = remainingBids > 0 ? `See More Bids (${remainingBids} more)` : "Show Less";
    toggleButton.classList.add("toggle-btn", "bg-RoyalBlue", "text-white", "py-2", "px-4", "rounded", "hover:bg-blue-700");

    toggleButton.addEventListener("click", () => {
      displayedBidsCount = remainingBids > 0 ? Math.min(displayedBidsCount + 3, sortedBids.length) : 3;
      renderBids();
    });

    return toggleButton;
  }

  function renderBids() {
    bidsContainer.innerHTML = ""; // Clear previous bids

    const bidsToDisplay = sortedBids.slice(0, displayedBidsCount);
    bidsToDisplay.forEach((bid) => {
      const bidElement = createBidElement(bid);
      bidsContainer.appendChild(bidElement);
    });

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
  initializeSearch(
    "search-bar",
    "search-btn",
    "dropdown-container",
    "dropdown-list"
  );
});

// Handle credits fetching and storage
async function fetchAndStoreCredits() {
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  if (!accessToken || !userName) {
    return; // User is not logged in, no need to fetch credits
  }

  try {
    const credits = await fetchUserCreditsApi(userName, accessToken, apiKey);
    localStorage.setItem("userCredits", credits || 0);

    const creditsHeader = document.getElementById("user-credits-header");
    if (creditsHeader) {
      creditsHeader.textContent = `Credits: ${credits || 0}`;
    }
  } catch (error) {
    console.error("Error fetching credits:", error);
    alert("There was an error fetching credits. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndStoreCredits();
});
