import { apiKey } from "../../constants/config.js";

const apiUrl = "https://v2.api.noroff.dev/";

// Function to get the listing ID from the URL query parameters
function getListingIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("listingId");
}

// Function to check if the auction has ended
function hasAuctionEnded(endsAt) {
  const currentDate = new Date();
  const endDate = new Date(endsAt);
  return currentDate >= endDate;
}

// Function to display the bid form for logged-in users
async function displayBidForm() {
  const bidFormContainer = document.getElementById("bid-form-container");
  const listingId = getListingIdFromUrl(); // Get the listingId from the URL

  try {
    // Fetch current listing details to check if bidding has ended
    const response = await fetch(`${apiUrl}auction/listings/${listingId}?_bids=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing! Status: ${response.status}`);
    }

    const result = await response.json();
    const listing = result.data;

    // Check if auction has ended
    if (hasAuctionEnded(listing.endsAt)) {
      bidFormContainer.innerHTML = `
        <p>The auction for this listing has ended. Bidding is no longer available.</p>
      `;
      return; // Exit the function if the auction has ended
    }

    // Display the bid form if auction is still active
    bidFormContainer.innerHTML = `
      <form id="place-bid-form">
        <label for="bid-amount">Enter your bid amount:</label>
        <input type="number" id="bid-amount" name="bid-amount" required min="1" step="any" />
        <button type="submit">Place Bid</button>
      </form>
    `;

    const placeBidForm = document.getElementById("place-bid-form");
    placeBidForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const bidAmount = parseFloat(document.getElementById("bid-amount").value.trim());
      if (isNaN(bidAmount) || bidAmount < 1 || bidAmount > 1000) {
        alert("Please enter a valid bid amount between 1 and 1000.");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const userName = localStorage.getItem("userName");

      if (!accessToken || !userName) {
        alert("You must be logged in to place a bid.");
        return;
      }

      try {
        // Fetch current listing details to get the highest bid
        const response = await fetch(`${apiUrl}auction/listings/${listingId}?_bids=true`);
        if (!response.ok) {
          throw new Error(`Failed to fetch listing! Status: ${response.status}`);
        }

        const result = await response.json();
        const listing = result.data;

        // Find the current highest bid from the bids array
        const currentHighestBid = listing.bids && listing.bids.length > 0
          ? Math.max(...listing.bids.map(bid => bid.amount)) // Find the highest bid
          : 0;

        if (bidAmount <= currentHighestBid) {
          alert(`Your bid must be higher than the current bid of ${currentHighestBid}.`);
          return;
        }

        // Place the bid if it's valid
        console.log("Placing bid with amount:", bidAmount);

        const bidResponse = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}/bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey, // Replace with actual API key if needed
          },
          body: JSON.stringify({ amount: bidAmount }),
        });

        if (!bidResponse.ok) {
          const bidResponseData = await bidResponse.json();
          console.error("Error placing bid:", bidResponseData);
          const errorMessage = bidResponseData.errors?.[0]?.message || "An unknown error occurred";
          throw new Error(`Failed to place bid. Status: ${bidResponse.status}, Message: ${errorMessage}`);
        } else {
          const bidResult = await bidResponse.json();
          console.log("Bid placed successfully:", bidResult);
          alert("Your bid has been placed successfully!");

          // Optionally refresh the page or update the listing UI with the latest bid data
          fetchAndDisplayListing(listingId); // Call a function to update listing details
        }
      } catch (error) {
        console.error("Error placing bid:", error);
        alert("There was an error placing your bid. Please try again.");
      }
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    bidFormContainer.innerHTML = `<p>Error loading auction details. Please try again later.</p>`;
  }
}

// Function to update user credits display
function updateUserCreditsDisplay(updatedCredits) {
  const userCreditsHeader = document.getElementById("user-credits-header");
  if (userCreditsHeader) {
    userCreditsHeader.textContent = `Credits: ${updatedCredits}`;
  }
}

// Function to fetch and display the listing details
async function fetchAndDisplayListing() {
  const listingId = getListingIdFromUrl(); // Get listingId from URL
  if (!listingId) {
    console.error("No listingId found in URL.");
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

// Function to render the listing on the page
// Function to render the listing with a carousel and bottom buttons
function displayListing(listing) {
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
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <!-- Title and Description -->
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${title}</h2>
        <p class="text-gray-600">${description}</p>
      </div>

      <!-- Carousel -->
      <div class="relative">
        <div class="carousel overflow-hidden relative rounded-lg">
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
                  class="pagination-button w-3 h-3 rounded-full bg-gray-300 focus:outline-none" 
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
        button.classList.add("bg-gray-800");
        button.classList.remove("bg-gray-300");
      } else {
        button.classList.add("bg-gray-300");
        button.classList.remove("bg-gray-800");
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




// Function to display bids
// Function to display bids
function displayBids(listing) {
  const bidsContainer = document.getElementById("bids-container");

  if (!listing.bids || listing.bids.length === 0) {
    bidsContainer.innerHTML = "<p>No bids placed yet for this listing.</p>";
    return;
  }

  // Sort bids in descending order (highest bid first)
  const sortedBids = [...listing.bids].sort((a, b) => b.amount - a.amount);

  let displayedBidsCount = 3; // Number of bids to show initially
  let showAll = false; // Toggle to track state

  const renderBids = () => {
    bidsContainer.innerHTML = ""; // Clear previous content

    const bidsToDisplay = showAll 
      ? sortedBids 
      : sortedBids.slice(0, displayedBidsCount);

    bidsToDisplay.forEach((bid) => {
      const bidElement = document.createElement("div");
      bidElement.classList.add("bid-item");
      bidElement.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <p class="text-lg font-semibold text-gray-800"><strong>Bid Amount:</strong> ${bid.amount}</p>
          <p class="text-sm text-gray-600"><strong>Bidder:</strong> ${bid.bidder?.name || "Anonymous"}</p>
          <p class="text-sm text-gray-500"><strong>Placed on:</strong> ${new Date(bid.created).toLocaleString()}</p>
        </div>
      `;
      bidsContainer.appendChild(bidElement);
    });

    // Add the toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = showAll 
      ? "Show Less" 
      : `See More Bids (${Math.min(sortedBids.length - displayedBidsCount, 3)} more)`;
    toggleButton.classList.add("toggle-btn", "bg-blue-500", "text-white", "py-2", "px-4", "rounded", "hover:bg-blue-700");
    toggleButton.addEventListener("click", () => {
      if (showAll) {
        displayedBidsCount = 3; // Reset to initial count
        showAll = false; // Collapse back
      } else {
        displayedBidsCount += 3; // Extend by 3
        if (displayedBidsCount >= sortedBids.length) {
          showAll = true; // If all bids are displayed, switch to "Show Less"
        }
      }
      renderBids(); // Re-render the bids
    });

    bidsContainer.appendChild(toggleButton);
  };

  // Initial render of bids
  renderBids();
}

// Function to show login prompt
function showLoginPrompt() {
  const bidsContainer = document.getElementById("bids-container");
  bidsContainer.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-center">
      <p class="text-yellow-700 text-lg">Log in to view the bids for this listing.</p>
      <a href="/templates/auth/login.html" class="text-yellow-600 hover:text-yellow-800">Click here to log in</a>
    </div>
  `;
}




// On page load, fetch the user's credits from localStorage and update the UI
document.addEventListener("DOMContentLoaded", () => {
  const userCredits = localStorage.getItem("userCredits") || "0";
  updateUserCreditsDisplay(parseFloat(userCredits));

  // Fetch and display the listing details
  fetchAndDisplayListing();
});



document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById('user-icon'); // Element for user icon/profile picture
  const accessToken = localStorage.getItem('accessToken'); // Retrieve token from localStorage
  const userName = localStorage.getItem('userName'); // Retrieve username
  const userAvatar = localStorage.getItem('userAvatar'); // Retrieve avatar URL

  // Check if the user is logged in
  if (!accessToken || !userName) {
      // Not logged in: Show default icon and link to the login page
      console.log("No logged-in user detected. Showing default icon.");
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
      console.log("Logged-in user detected. Displaying avatar.");
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
      console.log("User logged in, but no avatar found. Showing default profile icon.");
      if (userIcon) {
          userIcon.innerHTML = `
              <a href="/templates/auth/posts/user/profile.html">
                  <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
              </a>
          `;
      }
  }
});


