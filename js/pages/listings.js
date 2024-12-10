
  import { apiUrl, apiKey } from "../constants/config.js";
  import { handleErrorInBidForm, fetchListingDetails } from "./details.js";
  import { setupBidSubmissionHandler } from "./details.js";
  import { deleteListing } from "../modules/api.js";

  let listingsArray = []; // Listings array

  export const accessToken = localStorage.getItem('accessToken');
  export const userName = localStorage.getItem('userName');  // Assuming userName is stored in localStorage

  
  // Display posts dynamically
export function displayPosts(posts) {
  const postsContainer = document.getElementById("random-posts-container");
  postsContainer.innerHTML = posts
    .map((post) => {
      const imageUrl = post.media?.[0]?.url || null;
      if (!imageUrl) return "";
      return `
        <div class="flex justify-center items-center">
          <a href="/templates/auth/posts/details.html?listingId=${post.id}" class="block transform transition-transform hover:scale-110">
            <img src="${imageUrl}" alt="${post.title}" class="h-28 w-40 object-cover">
          </a>
        </div>`;
    })
    .join("");
}





// listings.js

// Function to get the top 3 newest listings for the carousel
export function getTop3NewestListings(listings) {
  return listings
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 3); // Return the top 3 newest listings
}

// Function to display the carousel for top 3 newest listings
// listings.js
export function displayCarousel(listings) {
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  const carouselDots = document.getElementById('carousel-dots');
  let currentIndex = 0;

  // Clear previous carousel items
  carouselWrapper.innerHTML = '';
  carouselDots.innerHTML = '';

  // Build HTML for carousel items
  const carouselItemsHTML = listings.map((listing, index) => `
  <a href="/templates/auth/posts/details.html?listingId=${listing.id}" class="carouselContainerMain">
    <!-- Text Container -->
    <div class="textContainer">
      <h3 class="titleStylingCarousel">
        ${listing.title}
      </h3>
      <p class="textStylingCarousel">
        ${listing.description || "No description available"}
      </p>
    </div>
    <!-- Image Container -->
    <div class="w-full flex justify-center items-center overflow-hidden md:w-1/2 m-4">
      ${listing.media && listing.media[0] 
        ? `<img src="${listing.media[0].url}" alt="${listing.media[0].alt || 'Item Image'}" class="imageCarousel" />`
        : ''}
    </div>
  </a>
`).join('');


  // Build HTML for carousel dots
  const carouselDotsHTML = listings.map((_, index) => `
    <button class="w-12 h-1.5 bg-RoyalBlue hover:bg-PersianBlue" data-index="${index}"></button>
  `).join('');

  // Set the HTML for the carousel and dots
  carouselWrapper.innerHTML = carouselItemsHTML;
  carouselDots.innerHTML = carouselDotsHTML;

  // Attach click event listeners to the dots
  const dots = Array.from(carouselDots.children);
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarouselPosition();
    });
  });

  function updateCarouselPosition() {
    const offset = -currentIndex * 100;
    carouselWrapper.style.transform = `translateX(${offset}%)`;
  }

  updateCarouselPosition();
}





// Function to display auction listings in the HTML
export function displayListings(listings) {
  const listingsContainer = document.getElementById('listings-container');

  // Utility function to format the status bar based on listing status
  const getStatusBar = (isActive, isEnded) => {
    if (isActive) {
      return `<div class="isActive">Active</div>`;
    }
    if (isEnded) {
      return `<div class="isEnded">Ended</div>`;
    }
    return '';
  };

  // Utility function to handle image rendering
  const getImageMarkup = (imageUrl, imageAlt) => {
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover" />`;
    }
    return '<div class="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">No Image Available</div>';
  };

  // Iterate through each listing and create the HTML structure
  listings.forEach(listing => {
    const listingElement = document.createElement('div');
    listingElement.classList.add(
      'shadow-lg', 'mb-6', 
      'w-full', 'max-w-sm', 'h-full'
    );

    const imageUrl = listing.media?.[0]?.url || null;
    const imageAlt = listing.media?.[0]?.alt || "Item Image";
    const isActive = new Date(listing.endsAt) > new Date();
    const isEnded = new Date(listing.endsAt) < new Date();

    const statusBar = getStatusBar(isActive, isEnded);
    const imageMarkup = getImageMarkup(imageUrl, imageAlt);

    listingElement.innerHTML = `
    <a href="/templates/auth/posts/details.html?listingId=${listing.id}" class="block text-RoyalBlue break-words">
      <div class="relative flex justify-center">
        ${statusBar}
        <p class="BidBox">
          Bids: ${listing._count?.bids || 0}
        </p>
        ${imageMarkup}
      </div>
      <div class="p-3">
        <div>
          <h3 class="post-card-title text-xl font-semibold mb-4 overflow-hidden text-ellipsis">
            ${listing.title}
          </h3>
          <p class="text-xs text-black mb-2">Tags: ${listing.tags?.length ? listing.tags.join(', ') : 'None'}</p>
        </div>
        <div class=" text-xs text-Boulder">
          <p>
            <span>Created: ${new Date(listing.created).toLocaleString()}</span>
            <span> | Ends At: ${new Date(listing.endsAt).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </a>
    `;
    

    listingsContainer.appendChild(listingElement);
  });
}

export function displayListing(listing) {
  const listingContainer = document.getElementById("listing-container");

  const title = listing.title || "No title available";
  const description = listing.description || "No description available";
  const tags = listing.tags.length > 0 ? listing.tags.join(", ") : "No tags available";
  const endDate = listing.endsAt ? new Date(listing.endsAt).toLocaleString() : "End date not available";
  const bidsCount = listing._count?.bids || "No bids yet";

  const createdDate = listing.created ? new Date(listing.created).toLocaleString() : "Creation date not available";
  const updatedDate = listing.updated ? new Date(listing.updated).toLocaleString() : "Last update not available";

  const sellerName = listing.seller?.name || "Seller information not available";
  const sellerEmail = listing.seller?.email || "Email not available";

  // Default image if no images available
  const defaultImage = "default-image.jpg";
  const images = listing.media && listing.media.length > 0 
    ? listing.media 
    : [{ url: defaultImage, alt: "Image not available" }];

  listingContainer.innerHTML = `
    <div class="p-6 shadow-lg max-w-4xl mx-auto">
      <!-- Title and Description -->
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${title}</h2>
        <p class="text-gray-600">${description}</p>
      </div>

      <!-- Carousel -->
      <div class="relative">
        <div class="carousel overflow-hidden relative">
          <div id="carousel-items" class="flex transition-transform duration-500 ease-in-out">
            ${images
              .map(
                (image) => `
                <div class="flex-shrink-0 w-full flex items-center justify-center">
                  <img 
                    src="${image.url}" 
                    alt="${image.alt || 'Listing Image'}" 
                    class="w-auto max-h-96"
                  />
                </div>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Pagination Buttons (only shown if there are multiple images) -->
        ${
          images.length > 1
            ? `
          <div id="carousel-pagination" class="flex justify-center mt-4 space-x-2">
            ${images
              .map(
                (_, index) => `
                <button 
                  class="pagination-button w-3 h-3 rounded-full bg-RoyalBlue focus:outline-none" 
                  data-index="${index}"
                ></button>
              `
              )
              .join("")}
          </div>
          `
            : ""
        }
      </div>

      <!-- Details Section -->
      <div class="mt-6 space-y-2 text-gray-800">
        <p><strong>Tags:</strong> ${tags}</p>
        <p><strong>Created:</strong> ${createdDate}</p>
        <p><strong>Last Updated:</strong> ${updatedDate}</p>
        <p><strong>Ends:</strong> ${endDate}</p>
        <p><strong>Bids:</strong> ${bidsCount}</p>
        <p><strong>Seller:</strong> ${sellerName}</p>
        <p><strong>Seller Email:</strong> ${sellerEmail}</p>
      </div>
    </div>
  `;

  // Carousel Logic
  const carouselItems = document.getElementById("carousel-items");
  const paginationButtons = document.querySelectorAll(".pagination-button");

  let currentIndex = 0;

  function updateCarousel(index) {
    currentIndex = index;
    const offset = -currentIndex * 100;
    carouselItems.style.transform = `translateX(${offset}%)`;

    // Update button styles
    paginationButtons.forEach((button, idx) => {
      if (idx === currentIndex) {
        button.classList.add("bg-RoyalBlue");
        button.classList.remove("bg-gray-300");
      } else {
        button.classList.add("bg-gray-300");
        button.classList.remove("bg-RoyalBlue");
      }
    });
  }

  // Attach event listeners to pagination buttons if there are multiple images
  if (images.length > 1) {
    paginationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = parseInt(button.getAttribute("data-index"));
        updateCarousel(index);
      });
    });

    // Initialize carousel
    updateCarousel(0);
  }
}

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
    console.log("Fetching listing from:", listingUrl); // Debugging line to verify the URL

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
      "bg-blue-500",
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

export async function fetchUserListings() {
  const apiUrl = `https://v2.api.noroff.dev/auction/profiles/${userName}/listings`;

  try {
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Noroff-API-Key': apiKey,
          },
      });

      const responseBody = await response.json();


      if (!response.ok) {
          console.error('Failed to fetch listings:', responseBody);
          alert(`Failed to fetch listings: ${responseBody.message || 'Unknown error'}`);
          return;
      }

      listingsArray = responseBody.data || responseBody;

      if (!Array.isArray(listingsArray)) {
          throw new Error('Listings data is not an array.');
      }

      const listingsList = document.getElementById('listings-list');
      listingsList.innerHTML = listingsArray.map(listing => {
          // Create the URL for the listing details page
          const listingUrl = `/templates/auth/posts/details.html?listingId=${listing.id}`;

          return `
          <li class="bg-white shadow-md overflow-hidden mb-6 border border-gray-200" id="listing-${listing.id}">
              <a href="${listingUrl}" class="block p-4" style="text-decoration: none; color: inherit;">
                  <h3 class="listing-title text-lg font-semibold text-gray-800 mb-2">${listing.title}</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 listing-media-container">
                      ${Array.isArray(listing.media) ? listing.media.map(media => `
                          <img class="listing-media" src="${media.url}" alt="${media.alt || 'Listing media'}">
                      `).join('') : '<p class="text-gray-500">No media available</p>'}
                  </div>
                  <p class="listing-description text-gray-600 text-sm mb-4">${listing.description || 'No description available'}</p>
                  <p class="text-gray-500 text-xs mb-2">Created: ${new Date(listing.created).toLocaleDateString()}</p>
                  <p class="text-gray-500 text-xs mb-4">Ends: ${new Date(listing.endsAt).toLocaleDateString()}</p>
              </a>
              <div class="flex justify-between p-4">
                  <button 
                      class="bg-RoyalBlue text-white px-4 py-2 mt-2 hover:bg-blue-700"
                      id="edit-btn-${listing.id}"
                  >
                      Edit
                  </button>
                  <button 
                      class="bg-red-500 text-white px-4 py-2 mt-2 hover:bg-red-600"
                      id="delete-btn-${listing.id}"
                  >
                      Delete
                  </button>
              </div>
          </li>
      `;
      }).join('');

      // Re-attach the event listeners after rendering
      listingsArray.forEach(listing => {
          const editButton = document.getElementById(`edit-btn-${listing.id}`);
          if (editButton) {
              editButton.addEventListener('click', function() {
                  openEditForm(listing.id);
              });
          }

          // Add delete button functionality
          const deleteButton = document.getElementById(`delete-btn-${listing.id}`);
          if (deleteButton) {
              deleteButton.addEventListener('click', function() {
                  // Ask for confirmation before deleting
                  const confirmed = confirm("Are you sure you want to delete this listing?");
                  if (confirmed) {
                      deleteListing(listing.id);
                  }
              });
          }
      });

  } catch (error) {
      console.error("Error fetching user listings:", error);
      alert("There was an error fetching listings for this user. Please try again.");
  }
}

export async function fetchUserProfile() {
  if (!accessToken || !userName) {
      alert("You are not logged in. Please log in first.");
      return;
  }

  try {
      // Fetch profile data
      const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Noroff-API-Key': apiKey,
          },
      });

      if (!response.ok) throw new Error('Error fetching user profile.');

      const profileData = await response.json();


      const { name, bio, avatar, banner, listings, credits } = profileData.data;

      // Display the profile info
      document.getElementById('user-credits-header').textContent = `Credits: ${credits || 0}`;
      document.getElementById('user-credits-profile').textContent = `Credits: ${credits || 0}`;
      document.getElementById('banner-img').src = banner?.url || '/templates/auth/posts/user/default-banner.jpg';
      document.getElementById('avatar-img').src = avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';
      document.getElementById('user-name').textContent = name || 'Unknown Name';
      document.getElementById('user-email').textContent = userName || 'Username not available';
      document.getElementById('user-bio').textContent = bio || 'No bio available';

      // If listings are included in profile data, use them, else fetch them separately
      const listingsList = document.getElementById('listings-list');
      if (listings && listings.length > 0) {
          listingsList.innerHTML = listings.map(listing => `
              <li class="listing-item">
                  <div class="listing-title"><strong>${listing.title}</strong></div>
                  <div class="listing-description">${listing.description || 'No description available'}</div>
                  <div class="listing-created">Created: ${new Date(listing.created).toLocaleDateString()}</div>
                  <div class="listing-endsAt">Ends: ${new Date(listing.endsAt).toLocaleDateString()}</div>
              </li>
          `).join('');
      } else {
          // If listings are not found, fetch them separately
          await fetchUserListings();
      }
  } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("There was an error loading your profile. Please try again.");
  }
}

// Function to display auction wins
export function displayWins(wins) {
  console.log("Rendering wins:", wins);  // Debug the wins array

  const winsContainer = document.getElementById('wins-container');
  if (!winsContainer) {
      console.error("Wins container not found in the DOM!");
      return;
  }

  // Clear the previous content in the container
  winsContainer.innerHTML = '';

  // If no wins, display the new personalized message
  if (!wins || wins.length === 0) {
      winsContainer.innerHTML = '<p>You have no wins yet.</p>';
      return;
  }

  wins.forEach(win => {
      const winElement = document.createElement('div');
      winElement.classList.add('win-card', 'bg-white', 'shadow-lg', 'mb-6', 'p-3', 'flex', 'flex-col', 'h-full');

      // Handle missing media or fallback image
      const imageUrl = (win.media && win.media.length > 0) ? win.media[0].url : 'default-image.jpg';
      const imageAlt = win.title || 'Auction Item';
      const listingId = win.id; // The listing ID for the link

      // Dynamically generate the URL for the listing details page
      const listingUrl = `/templates/auth/posts/details.html?listingId=${listingId}`;

      winElement.innerHTML = `
          <a href="${listingUrl}" class="win-link">
              <div class="relative">
                  <!-- Won label -->
                  <div class="absolute top-0 left-0 w-full bg-green-500 text-white text-xs font-bold px-4 py-1 text-center">
                      Won!
                  </div>
                  <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover" />
                  <div class="win-info p-3">
                      <h3 class="win-title text-xl font-semibold">${win.title}</h3>
                      <p class="win-description">${win.description}</p>
                      <span class="win-created text-sm text-gray-500">Won on: ${new Date(win.created).toLocaleDateString()}</span>
                  </div>
              </div>
          </a>
      `;

      winsContainer.appendChild(winElement);
  });
}


//placeholder
// Open the edit form and populate it with listing data
function openEditForm(listingId) {
  const listing = listingsArray.find(item => item.id === listingId);

  if (listing) {

      // Pre-fill the form fields with the listing's data
      document.getElementById('listing-id').value = listing.id;  // Set listing ID in hidden input
      document.getElementById('edit-title').value = listing.title;
      document.getElementById('edit-description').value = listing.description;
      document.getElementById('edit-media').value = listing.media && listing.media[0] ? listing.media[0].url : ''; // Handle media URL

      // Show the form (remove the 'hidden' class)
      document.getElementById('edit-form-container').classList.remove('hidden');
  } else {
      console.log('Listing not found');
      alert('Listing not found!');
  }
}