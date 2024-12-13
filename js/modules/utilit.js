import { apiUrl } from "../constants/config.js";
import { displayListings, displayPosts } from "../pages/listings.js";
import { fetchFromApi } from "./api.js";

// userUtils.js

let allListings = []; // Store all the listings globally
let currentPage = 1; // Track the current page
const listingsPerPage = 10; // Number of listings to display per page

/**
 * Updates the user icon based on login status and avatar.
 */
export function updateUserIcon() {
    const userIconDesktop = document.getElementById("user-icon");
    const userIconMobile = document.getElementById("mobile-user-icon");

    const accessToken = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");
    const userAvatar = localStorage.getItem("userAvatar");

    if (!accessToken || !userName) {
        // If not logged in, display login link
        const loginHTML = `
            <a href="/templates/auth/login.html">
                <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
            </a>`;
        if (userIconDesktop) userIconDesktop.innerHTML = loginHTML;
        if (userIconMobile) userIconMobile.innerHTML = loginHTML;
        return;
    }

    // Display avatar if available, or fallback to default
    const userIconHTML = userAvatar
        ? `<a href="/templates/auth/posts/user/profile.html">
              <img src="${userAvatar}" alt="User Profile"
                   class="w-10 h-10 rounded-full border-2 hover:border-RoyalBlue"
                   onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';">
           </a>`
        : `<a href="/templates/auth/posts/user/profile.html">
              <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
           </a>`;

    if (userIconDesktop) userIconDesktop.innerHTML = userIconHTML;
    if (userIconMobile) userIconMobile.innerHTML = userIconHTML;
}

export function displayUserCredits() {
    const credits = localStorage.getItem("userCredits") || 0;

    const creditsElementDesktop = document.getElementById("user-credits-header");
    const creditsElementMobile = document.getElementById("mobile-user-credits");

    if (creditsElementDesktop) {
        creditsElementDesktop.textContent = `Credits: ${credits}`;
    }
    if (creditsElementMobile) {
        creditsElementMobile.textContent = `Credits: ${credits}`;
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


// Get elements for the hamburger menu
const hamburgerIcon = document.getElementById('hamburger-icon');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');

// Function to open the mobile menu (slide in from the right)
export function openMobileMenu() {
  if (hamburgerIcon && mobileMenu) { // Check if elements exist
    hamburgerIcon.addEventListener('click', () => {
      mobileMenu.style.right = '0'; // Slide menu in
    });
  }
}

// Function to close the mobile menu (slide out to the right)
export function closeMobileMenu() {
  if (closeMenu && mobileMenu) { // Check if elements exist
    closeMenu.addEventListener('click', () => {
      mobileMenu.style.right = '-100%'; // Slide menu out
    });
  }
}

// Function to initialize the mobile menu functionality
export function initMobileMenu() {
  openMobileMenu();
  closeMobileMenu();
}


// Fetch random posts
export async function getRandomPosts(count = 4) {
    const result = await fetchFromApi("auction/listings");
    const listings = Array.isArray(result.data) ? result.data : [];
  
    // Filter listings to include only those with images
    const listingsWithImages = listings.filter(listing => 
      listing.media?.length && listing.media[0]?.url
    );
  
    // Select random items from filtered listings
    const randomListings = getRandomItems(listingsWithImages, count);
  
    // Validate that images load successfully
    const validListings = await validateImages(randomListings);
  
    // Display the validated posts
    displayPosts(validListings);
  }
  
  // Function to check if images can be loaded
  async function validateImages(listings) {
    const loadImage = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
  
    const validListings = [];
    for (const listing of listings) {
      const imageUrl = listing.media?.[0]?.url;
      if (imageUrl) {
        const isValid = await loadImage(imageUrl);
        if (isValid) {
          validListings.push(listing);
        }
      }
    }
  
    return validListings;
  }
  
  
  // Utility function to get random items from an array
  export function getRandomItems(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Get the first 'count' items
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