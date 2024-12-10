// Imports
import { apiUrl } from "./constants/config.js";
import { 
  fetchSearchResults, 
  fetchAuctionListings,
   
} from "./modules/api.js";
import { initializeSearch } from "./modules/search.js";
import { handleAuthButtons } from "./auth/logout.js";
import { displayListings } from "./pages/listings.js";
import { 
  updateUserIcon, 
  displayUserCredits, 
  filterListings,
  getRandomItems,
  getRandomPosts
} from "./modules/utilit.js";


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

  
// Global variables
let allListings = []; // Store all the listings globally
let currentPage = 1; // Track the current page
const listingsPerPage = 10; // Number of listings to display per page

// Function to sort listings by creation date (newest first)
function sortListingsByNewest(listings) {
  return listings.sort((a, b) => new Date(b.created) - new Date(a.created)); // Sort by created date descending
}

// Function to load the next set of listings (for the "Show More" button)
function loadMoreListings() {
  const filteredListings = filterListings(allListings); // Get filtered listings
  const listingsToShow = filteredListings.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

  displayListings(listingsToShow); // Append the current set of listings to the existing ones
  currentPage++; // Increment the page for the next set of listings

  // Hide the "Show More" button if all listings are shown
  if (currentPage * listingsPerPage >= filteredListings.length) {
    document.getElementById("load-more-listings").style.display = "none";
  }
}

// Initialize user interface
displayUserCredits();
updateUserIcon();

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
    allListings = data.data; // Save the fetched listings globally
    currentPage = 1; // Reset page number to 1 when fetching new data

    loadMoreListings(); // Load the first set of listings by default
    loadMoreButton.style.display = "block"; // Show the "Show More" button
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
    listingsContainer.innerHTML = `<p>Error fetching listings: ${error.message}</p>`;
  }
}

// Add event listener for page load to fetch auction listings
document.addEventListener("DOMContentLoaded", function () {
  fetchAuctionListing();
});

// Add event listeners for checkboxes to filter the listings
const checkboxes = document.querySelectorAll(".filter-checkbox");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    currentPage = 1; // Reset to the first page when a filter is changed
    document.getElementById("listings-container").innerHTML = ""; // Clear current listings
    loadMoreListings(); // Reapply filters and load the first page
  });
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


