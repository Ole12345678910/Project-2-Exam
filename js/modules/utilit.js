import { apiUrl } from "../constants/config.js";
import { displayListings, displayPosts } from "../pages/listings.js";
import { fetchFromApi } from "./api.js";


/**
 * Updates the user icon based on login status and avatar.
 */
export function updateUserIcon() {
    const userIconDesktop = document.getElementById("user-icon");
    const userIconMobile = document.getElementById("mobile-user-icon");

    const accessToken = localStorage.getItem("accessToken");  // Get the access token from local storage
    const userName = localStorage.getItem("userName");        // Get the user's name from local storage
    const userAvatar = localStorage.getItem("userAvatar");    // Get the user's avatar image URL from local storage

    if (!accessToken || !userName) {
        // If the user is not logged in, display a login link
        const loginHTML = `
            <a href="/templates/auth/login.html">
                <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
            </a>`;
        if (userIconDesktop) userIconDesktop.innerHTML = loginHTML;
        if (userIconMobile) userIconMobile.innerHTML = loginHTML;
        return;
    }

    // If the user is logged in, display their avatar or fallback to default icon
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

/**
 * Displays the user's credits in the header or mobile view.
 */
export function displayUserCredits() {
    const credits = localStorage.getItem("userCredits") || 0; // Get user's credits from localStorage (defaults to 0)

    const creditsElementDesktop = document.getElementById("user-credits-header");
    const creditsElementMobile = document.getElementById("mobile-user-credits");

    // Update the displayed credits for both desktop and mobile versions
    if (creditsElementDesktop) {
        creditsElementDesktop.textContent = `Credits: ${credits}`;
    }
    if (creditsElementMobile) {
        creditsElementMobile.textContent = `Credits: ${credits}`;
    }
}

/**
 * Renders a message indicating that the auction for a listing has ended.
 * @param {HTMLElement} container - The DOM element where the message will be displayed.
 */
export function renderAuctionEndedMessage(container) {
  container.innerHTML = `
    <p>The auction for this listing has ended. Bidding is no longer available.</p>
  `;
}

/**
 * Renders a bid form where users can enter their bid amount.
 * @param {HTMLElement} container - The DOM element where the form will be displayed.
 */
export function renderBidForm(container) {
  container.innerHTML = `
<form id="place-bid-form" class="flex flex-col items-center">
  <label class="flex justify-center mb-2" for="bid-amount">Enter your bid amount:</label>
  <input type="number" id="bid-amount" name="bid-amount" required min="1" step="any" class="bidInput" />
  <button class="button-box" type="submit">Place Bid</button>
</form>
  `;
}

// Get elements for the hamburger menu
const hamburgerIcon = document.getElementById('hamburger-icon');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');

/**
 * Opens the mobile menu when the hamburger icon is clicked (slide in from the right).
 */
export function openMobileMenu() {
  if (hamburgerIcon && mobileMenu) { // Ensure elements exist
    hamburgerIcon.addEventListener('click', () => {
      mobileMenu.style.right = '0'; // Slide menu in
    });
  }
}

/**
 * Closes the mobile menu when the close icon is clicked (slide out to the right).
 */
export function closeMobileMenu() {
  if (closeMenu && mobileMenu) { // Ensure elements exist
    closeMenu.addEventListener('click', () => {
      mobileMenu.style.right = '-100%'; // Slide menu out
    });
  }
}

/**
 * Initializes the mobile menu functionality by calling the open and close menu functions.
 */
export function initMobileMenu() {
  openMobileMenu();
  closeMobileMenu();
}

/**
 * Utility function to get a specified number of random items from an array.
 * @param {Array} arr - The array to sample items from.
 * @param {number} count - The number of items to return.
 * @returns {Array} A subset of the input array containing random items.
 */
function getRandomItems(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array randomly
    return shuffled.slice(0, count); // Return the first 'count' items
}

/**
 * Validates if images in listings can be loaded successfully.
 * @param {Array} listings - The listings to validate.
 * @returns {Promise<Array>} A list of valid listings with images that load.
 */
async function validateImages(listings) {
    const loadImage = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);  // If image loads successfully
        img.onerror = () => resolve(false); // If image fails to load
        img.src = url;
      });

    const validListings = [];
    for (const listing of listings) {
      const imageUrl = listing.media?.[0]?.url;
      if (imageUrl) {
        const isValid = await loadImage(imageUrl); // Check if the image loads successfully
        if (isValid) {
          validListings.push(listing); // Only include valid listings with images
        }
      }
    }

    return validListings;
}

/**
 * Fetches a list of random posts that have images.
 * @param {number} count - The number of random posts to retrieve.
 */
export async function getRandomPosts(count = 4) {
    let validListings = [];

    // Keep fetching until enough valid listings are found
    while (validListings.length < count) {
      const result = await fetchFromApi("auction/listings"); // Fetch listings from the API
      const listings = Array.isArray(result.data) ? result.data : [];

      // Filter listings to include only those with images
      const listingsWithImages = listings.filter(listing =>
        listing.media?.length && listing.media[0]?.url
      );

      // Select a random subset of listings
      const randomListings = getRandomItems(listingsWithImages, count);

      // Validate the random listings to ensure images load successfully
      const validRandomListings = await validateImages(randomListings);

      // Add valid listings to the list, avoiding duplicates
      validListings = [...validListings, ...validRandomListings];

      // If enough valid listings are found, break the loop
      if (validListings.length >= count) {
        validListings = validListings.slice(0, count); // Ensure exactly 'count' items
        break;
      }
    }

    // Display the valid posts
    displayPosts(validListings);
}

/**
 * Displays a prompt for users to log in to view bids for a listing.
 */
function showLoginPrompt() {
  const bidsContainer = document.getElementById("bids-container");
  bidsContainer.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-center">
      <p class="text-yellow-700 text-lg">Log in to view the bids for this listing.</p>
      <a href="/templates/auth/login.html" class="text-yellow-600 hover:text-yellow-800">Click here to log in</a>
    </div>
  `;
}
