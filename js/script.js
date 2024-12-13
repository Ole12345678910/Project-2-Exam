// Imports
import { apiUrl } from "./constants/config.js";
import { 
  fetchSearchResults, 
  fetchAuctionListings,
   
} from "./modules/api.js";
import { initializeSearch } from "./modules/search.js";
import { handleAuthButtons } from "./auth/logout.js";
//import { displayListings } from "./pages/listings.js";
import { 
  updateUserIcon, 
  displayUserCredits, 
  getRandomItems,
  getRandomPosts
} from "./modules/utilit.js";

// Initialize user interface
displayUserCredits();
updateUserIcon();


  // JavaScript to toggle mobile menu visibility
const hamburgerIcon = document.getElementById('hamburger-icon');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');

// Open the mobile menu
hamburgerIcon.addEventListener('click', () => {
  mobileMenu.classList.remove('hidden'); // Show the menu
});

// Close the mobile menu
closeMenu.addEventListener('click', () => {
  mobileMenu.classList.add('hidden'); // Hide the menu
});








// Event listener for the "Load More" button
document
  .getElementById("load-more-listings")
  .addEventListener("click", loadMoreListings);





// Add event listener for page load to fetch auction listings
document.addEventListener("DOMContentLoaded", function () {
  fetchAuctionListing();
});

// Add event listener for the "Show More" button
document
  .getElementById("load-more-listings")
  .addEventListener("click", loadMoreListings);

// Fetch auction listings and call top 3 newest listings (if implemented)
fetchAuctionListings();



// Fetch and display random posts
getRandomPosts();


// Search functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeSearch("search-bar", "search-btn", "dropdown-container", "dropdown-list");
});

// Handle logout buttons
handleAuthButtons();




























































let allListings = []; // Store all listings globally
let filteredListings = []; // Store filtered listings globally
let currentPage = 1; // Track the current page
const listingsPerPage = 10; // Number of listings to show per page

// Function to fetch auction listings
async function fetchAuctionListing() {
  const listingsContainer = document.getElementById("listings-container");
  const loadMoreButton = document.getElementById("load-more-listings");

  try {
    const response = await fetch(`${apiUrl}auction/listings`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    allListings = data.data; // Save fetched listings globally
    filteredListings = [...allListings]; // Initially, display all listings (no filter)

    loadMoreListings(); // Load the first set of listings
    loadMoreButton.style.display = "block"; // Show the "Load More" button
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
    listingsContainer.innerHTML = `<p>Error fetching listings: ${error.message}</p>`;
  }
}

// Function to apply the filter and return the filtered listings
function filterListings(listings) {
  const filterActiveEl = document.getElementById("filter-active");
  const filterEndedEl = document.getElementById("filter-ended");
  const filterHighestBidsEl = document.getElementById("filter-highest-bids");
  const filterLowestBidsEl = document.getElementById("filter-lowest-bids");

  const filterOptions = {
    active: filterActiveEl.checked,
    ended: filterEndedEl.checked,
    highestBids: filterHighestBidsEl.checked,
    lowestBids: filterLowestBidsEl.checked,
  };

  const now = new Date();

  // Filter listings based on active/ended status
  const filteredByStatus = listings.filter((listing) => {
    const isActive = new Date(listing.endsAt) > now;
    const isEnded = new Date(listing.endsAt) < now;

    return (
      (filterOptions.active && isActive) ||
      (filterOptions.ended && isEnded) ||
      (!filterOptions.active && !filterOptions.ended)
    );
  });

  // Sort listings based on the number of bids
  const sortedListings = filteredByStatus.sort((a, b) => {
    const bidCountA = a._count?.bids || 0;
    const bidCountB = b._count?.bids || 0;

    if (filterOptions.highestBids) {
      return bidCountB - bidCountA; // Sort descending by bid count
    }
    if (filterOptions.lowestBids) {
      return bidCountA - bidCountB; // Sort ascending by bid count
    }
    return 0; // No sorting if neither bid filter is selected
  });

  return sortedListings;
}

// Function to load listings (filtered and paginated)
function loadMoreListings() {
  const listingsToShow = filteredListings.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

  // Display the listings
  displayListings(listingsToShow);

  // Increment page number for the next set of listings
  currentPage++;

  // If we've reached the end of the filtered listings, hide the "Load More" button
  if (currentPage * listingsPerPage >= filteredListings.length) {
    document.getElementById("load-more-listings").style.display = "none";
  }
}

// Add event listeners for checkboxes to filter the listings
const checkboxes = document.querySelectorAll(".filter-checkbox");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    // Apply the filter to the global listings and update filtered listings
    filteredListings = filterListings(allListings);

    // Reset page to 1, but DO NOT clear listings from the container yet
    currentPage = 1;

    // Clear current listings in the container
    document.getElementById("listings-container").innerHTML = "";

    // Load the first set of filtered listings
    loadMoreListings();
  });
});

// Event listener for the "Load More" button
document
  .getElementById("load-more-listings")
  .addEventListener("click", loadMoreListings);

// Fetch auction listings and display them
fetchAuctionListing();

// Function to display the listings on the page
function displayListings(listings) {
  const listingsContainer = document.getElementById("listings-container");

  // Utility function to format the status bar based on listing status
  const getStatusBar = (isActive, isEnded) => {
    if (isActive) {
      return `<div class="isActive">Active</div>`;
    }
    if (isEnded) {
      return `<div class="isEnded">Ended</div>`;
    }
    return "";
  };

  // Utility function to handle image rendering
  const getImageMarkup = (imageUrl, imageAlt) => {
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover" />`;
    }
    return '<div class="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">No Image Available</div>';
  };

  // Iterate through each listing and create the HTML structure
  listings.forEach((listing) => {
    const listingElement = document.createElement("div");
    listingElement.classList.add(
      "shadow-lg",
      "mb-6",
      "w-full",
      "max-w-sm",
      "h-full"
    );

    const imageUrl = listing.media?.[0]?.url || null;
    const imageAlt = listing.media?.[0]?.alt || "Item Image";
    const isActive = new Date(listing.endsAt) > new Date();
    const isEnded = new Date(listing.endsAt) < new Date();

    const statusBar = getStatusBar(isActive, isEnded);
    const imageMarkup = getImageMarkup(imageUrl, imageAlt);

    listingElement.innerHTML = `
    <a href="/templates/auth/posts/details.html?listingId=${
      listing.id
    }" class="block text-RoyalBlue break-words">
      <div class="relative flex justify-center">
        ${statusBar}
        <p class="BidBox">
          Bids: ${listing._count?.bids || 0}
        </p>
        ${imageMarkup}
      </div>
      <div class="p-3">
        <div>
          <h3 class="post-card-title text-xl font-semibold mb-4 overflow-hidden text-ellipsis line-clamp-2 break-words">
            ${listing.title}
          </h3>
          <p class="text-xs text-black mb-2">Tags: ${
            listing.tags?.length ? listing.tags.join(", ") : "None"
          }</p>
        </div>
        <div class="text-xs text-Boulder">
          <p>
            <span>Created: ${new Date(listing.created).toLocaleString()}</span>
            <span> | Ends At: ${new Date(
              listing.endsAt
            ).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </a>
    `;

    listingsContainer.appendChild(listingElement);
  });
}
