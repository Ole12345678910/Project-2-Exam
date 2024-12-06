import { apiUrl } from "../constants/config.js";
import { displayListings } from "../pages/listings.js";
// userUtils.js

let allListings = []; // Store all the listings globally
let currentPage = 1; // Track the current page
const listingsPerPage = 10; // Number of listings to display per page

/**
 * Updates the user icon based on login status and avatar.
 */
export function updateUserIcon() {
  const userIcon = document.getElementById("user-icon");
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");
  const userAvatar = localStorage.getItem("userAvatar");

  // Check if the user is logged in
  if (!accessToken || !userName) {
    // Not logged in: Show default icon and link to the login page
    if (userIcon) {
      userIcon.innerHTML = `
          <a href="/templates/auth/login.html">
            <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
          </a>
        `;
    }
    return; // Exit function since no user is logged in
  }

  // User is logged in: Check for avatar
  if (userAvatar) {
    if (userIcon) {
      userIcon.innerHTML = `
          <a href="/templates/auth/posts/user/profile.html">
            <img src="${userAvatar}" alt="User Profile" 
                class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" 
                onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';">
          </a>
        `;
    }
  } else {
    console.log(
      "User logged in, but no avatar found. Showing default profile icon."
    );
    if (userIcon) {
      userIcon.innerHTML = `
          <a href="/templates/auth/posts/user/profile.html">
            <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
          </a>
        `;
    }
  }
}

/**
 * Displays user credits in the header.
 */
export function displayUserCredits() {
  const credits = localStorage.getItem("userCredits") || 0; // Default to 0 if not found
  const creditsElement = document.getElementById("user-credits-header");

  // Display the credits in the header
  if (creditsElement) {
    creditsElement.textContent = `Credits: ${credits}`;
  }
}

export function filterListings(listings) {
  // Get filter selections from the DOM
  const filterOptions = {
    active: document.getElementById("filter-active").checked,
    ended: document.getElementById("filter-ended").checked,
    highestBids: document.getElementById("filter-highest-bids").checked,
    lowestBids: document.getElementById("filter-lowest-bids").checked,
  };

  // Filter listings by Active or Ended status
  const filteredByStatus = listings.filter((listing) => {
    const isActive = new Date(listing.endsAt) > new Date();
    const isEnded = new Date(listing.endsAt) < new Date();

    return (
      (filterOptions.active && isActive) ||
      (filterOptions.ended && isEnded) ||
      (!filterOptions.active && !filterOptions.ended)
    );
  });

  // Sort listings by Bids (Highest or Lowest)
  const sortByBids = (a, b) => {
    const bidCountA = a._count?.bids || 0;
    const bidCountB = b._count?.bids || 0;

    if (filterOptions.highestBids) {
      return bidCountB - bidCountA; // Sort by highest number of bids (descending)
    } else if (filterOptions.lowestBids) {
      return bidCountA - bidCountB; // Sort by lowest number of bids (ascending)
    }
    return 0; // No sorting if neither bid filter is active
  };

  // Apply sorting if necessary
  return filteredByStatus.sort(sortByBids);
}

export function loadMoreListings() {
  const filteredListings = filterListings(allListings); // Get filtered listings
  const listingsToShow = filteredListings.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

  displayListings(listingsToShow); // Append the current set of listings to the existing ones
  currentPage++; // Increment the page for the next set of listings

  // If we've shown all listings, hide the "Show More" button
  if (currentPage * listingsPerPage >= filteredListings.length) {
    document.getElementById("load-more-button").style.display = "none";
  }
}

// ------------------------------------------------------------
// Function to fetch auction listings
// ------------------------------------------------------------
export async function fetchAuctionListing() {
    const listingsContainer = document.getElementById("listings-container");
    const loadMoreButton = document.getElementById("load-more-button");
  
    // Only proceed if both the elements exist in the DOM
    if (!listingsContainer || !loadMoreButton) {
      console.log("Required elements are not found on this page.");
      return; // Exit the function if the elements are not present
    }
  
    try {
      const response = await fetch(`${apiUrl}auction/listings`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      allListings = data.data;
      currentPage = 1;
  
      loadMoreListings(); // Call the function to load listings
      loadMoreButton.style.display = "block"; // Show "Load More" button
    } catch (error) {
      console.error("Failed to fetch auction listings:", error);
      listingsContainer.innerHTML = `<p>Error fetching listings: ${error.message}</p>`;
    }
  }
  
const loadMoreButton = document.getElementById("load-more-button");

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", loadMoreListings);
  }
  

// Render a message when the auction has ended
export function renderAuctionEndedMessage(container) {
  container.innerHTML = `
    <p>The auction for this listing has ended. Bidding is no longer available.</p>
  `;
}

// Render the bid form
export function renderBidForm(container) {
  container.innerHTML = `
    <form id="place-bid-form">
      <label for="bid-amount">Enter your bid amount:</label>
      <input type="number" id="bid-amount" name="bid-amount" required min="1" step="any" />
      <button type="submit">Place Bid</button>
    </form>
  `;
}

