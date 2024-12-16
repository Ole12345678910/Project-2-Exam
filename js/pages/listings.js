import { apiUrl, apiKey } from "../constants/config.js";
import {
  handleErrorInBidForm,
  fetchListingDetails,
  setupBidSubmissionHandler,
} from "./details.js";
import { deleteListing } from "../modules/api.js";

let listingsArray = []; // Listings array to store fetched listings

// Retrieve access token and user name from local storage
export const accessToken = localStorage.getItem("accessToken");
export const userName = localStorage.getItem("userName");

// Function to display a list of posts dynamically
export function displayPosts(posts) {
  const postsContainer = document.getElementById("random-posts-container");
  
  // Populate the container with posts dynamically
  postsContainer.innerHTML = posts
    .map((post) => {
      const imageUrl = post.media?.[0]?.url || null; // Get the image URL
      if (!imageUrl) return ""; // Skip rendering if no image
      return `
        <div class="flex justify-center items-center">
          <a href="/templates/auth/posts/details.html?listingId=${post.id}" class="block transform transition-transform hover:scale-110">
            <img src="${imageUrl}" alt="${post.title}" class="h-28 w-40 object-cover">
          </a>
        </div>`;
    })
    .join("");
}

// Function to display a carousel for top 3 newest listings
export function displayCarousel(listings) {
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  const carouselDots = document.getElementById("carousel-dots");
  let currentIndex = 0;

  // Clear any existing carousel items and dots
  carouselWrapper.innerHTML = "";
  carouselDots.innerHTML = "";

  // Build HTML for carousel items
  const carouselItemsHTML = listings
    .map(
      (listing, index) => `
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
      ${
        listing.media && listing.media[0]
          ? `<img src="${listing.media[0].url}" alt="${
              listing.media[0].alt || "Item Image"
            }" class="imageCarousel" />`
          : ""
      }
    </div>
  </a>
`
    )
    .join("");

  // Build HTML for carousel dots
  const carouselDotsHTML = listings
    .map(
      (_, index) => `
    <button class="w-12 h-1.5 bg-RoyalBlue hover:bg-PersianBlue" data-index="${index}"></button>
  `
    )
    .join("");

  // Set the HTML for carousel items and dots
  carouselWrapper.innerHTML = carouselItemsHTML;
  carouselDots.innerHTML = carouselDotsHTML;

  // Attach click event listeners to the dots for carousel navigation
  const dots = Array.from(carouselDots.children);
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentIndex = index;
      updateCarouselPosition();
    });
  });

  // Function to update the carousel position based on the current index
  function updateCarouselPosition() {
    const offset = -currentIndex * 100;
    carouselWrapper.style.transform = `translateX(${offset}%)`;
  }

  updateCarouselPosition();
}

// Function to display listings in a container
export function displayListings(listings) {
  const listingsContainer = document.getElementById("listings-container");

  // Clear previous listings if any
  listingsContainer.innerHTML = "";

  // Handle the case when there are no listings available
  if (!listings || listings.length === 0) {
    listingsContainer.innerHTML = `<p>No listings available.</p>`;
    return;
  }

  // Iterate through each listing and render it
  listings.forEach((listing, index) => {
    console.log(`Rendering Listing #${index}:`, listing);

    const listingElement = document.createElement("div");
    listingElement.classList.add("shadow-lg", "mb-6", "w-full", "max-w-sm", "h-full");

    // Extract data for rendering, with fallbacks if values are missing
    const imageUrl = listing.media?.[0]?.url || "default-image.jpg"; // Default image fallback
    const imageAlt = listing.media?.[0]?.alt || "Item Image";
    const isActive = new Date(listing.endsAt) > new Date();
    const isEnded = new Date(listing.endsAt) < new Date();
    const sellerName = listing.seller?.name || "Seller information not available";
    const sellerEmail = listing.seller?.email || "Email not available";

    console.log(`Seller Name: ${sellerName}, Seller Email: ${sellerEmail}`); // Debugging log for seller data

    // Determine status of the listing based on the end date
    const statusBar = getStatusBar(isActive, isEnded);
    const imageMarkup = getImageMarkup(imageUrl, imageAlt);

    // Render the listing HTML
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
            <p class="text-xs text-black mb-2">Tags: ${
              listing.tags?.length ? listing.tags.join(", ") : "None"
            }</p>
          </div>
          <div class="text-xs text-Boulder">
            <p>
              <span>Created: ${new Date(listing.created).toLocaleString()}</span>
              <span> | Ends At: ${new Date(listing.endsAt).toLocaleString()}</span>
            </p>
          </div>
          <!-- Seller details -->
          <div class="mt-2 text-xs text-gray-700">
            <p><strong>Seller Name:</strong> ${sellerName}</p>
            <p><strong>Seller Email:</strong> ${sellerEmail}</p>
          </div>
        </div>
      </a>
    `;

    listingsContainer.appendChild(listingElement);
  });
}

// Function to initialize the carousel for listing images
function initializeCarousel(carouselId, paginationId) {
  const carouselItems = document.getElementById(carouselId);
  const paginationButtons = document.querySelectorAll(`#${paginationId} .pagination-button`);

  if (!carouselItems) {
    console.error(`Carousel items not found: #${carouselId}`);
    return;
  }

  if (paginationButtons.length === 0) {
    console.error(`Pagination buttons not found: #${paginationId}`);
    return;
  }

  let currentIndex = 0;

  // Function to update the carousel index
  function updateCarousel(index) {
    currentIndex = index;
    const offset = -currentIndex * 100;
    carouselItems.style.transform = `translateX(${offset}%)`;

    paginationButtons.forEach((button, idx) => {
      if (idx === currentIndex) {
        button.classList.add("bg-RoyalBlue");
        button.classList.remove("bg-Gallery");
      } else {
        button.classList.add("bg-Gallery");
        button.classList.remove("bg-RoyalBlue");
      }
    });
  }

  // Add click listeners to pagination buttons for carousel navigation
  paginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = parseInt(button.getAttribute("data-index"));
      updateCarousel(index);
    });
  });

  updateCarousel(0); // Initialize to first item
}

// Function to format dates
function formatDate(date) {
  return date ? new Date(date).toLocaleString() : "Date not available";
}

// Function to retrieve images, fallback to default if empty
function getImages(media) {
  const defaultImage = "default-image.jpg";
  return media && media.length > 0 ? media : [{ url: defaultImage, alt: "Image not available" }];
}

// Function to render the carousel HTML structure for listing images
function renderCarousel(images, listingId) {
  return `
    <div class="relative">
      <div class="carousel overflow-hidden relative">
        <div id="carousel-items-${listingId}" class="flex transition-transform duration-500 ease-in-out">
          ${images.map((image) => `
            <div class="flex-shrink-0 w-full flex items-center justify-center">
              <img 
                src="${image.url}" 
                alt="${image.alt || "Listing Image"}" 
                class="w-auto max-h-96"
              />
            </div>
          `).join("")}
        </div>
      </div>

      ${images.length > 1 ? `
        <div id="carousel-pagination-${listingId}" class="flex justify-center mt-4 space-x-2">
          ${images.map((_, index) => `
            <button 
              class="pagination-button w-3 h-3 rounded-full bg-RoyalBlue focus:outline-none" 
              data-index="${index}"
            ></button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

// Function to render the full details for a listing
function renderListingDetails(listing, isUserListing = false) {
  const title = listing.title || "No title available";
  const description = listing.description || "No description available";
  const tags = listing.tags && listing.tags.length > 0 ? listing.tags.join(", ") : "No tags available";
  const endDate = formatDate(listing.endsAt);
  const bidsCount = listing._count?.bids || "No bids yet";
  const createdDate = formatDate(listing.created);
  const updatedDate = formatDate(listing.updated);

  // Fallback for seller name and email if they are missing
  const sellerName = listing.seller?.name || "Seller information not available";
  const sellerEmail = listing.seller?.email || "Email not available";

  return `
    <div class="p-6 shadow-lg max-w-4xl mx-auto">
      <a href="/templates/auth/posts/details.html?listingId=${listing.id}" class="block mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2 break-words line-clamp-2">${title}</h2>
        <p class="text-gray-600">${description}</p>
      </a>

      ${renderCarousel(getImages(listing.media), listing.id)}

      <div class="mt-6 space-y-2 text-gray-800">
        <p><strong>Tags:</strong> ${tags}</p>
        <p><strong>Created:</strong> ${createdDate}</p>
        <p><strong>Last Updated:</strong> ${updatedDate}</p>
        <p><strong>Ends:</strong> ${endDate}</p>
        <p><strong>Bids:</strong> ${bidsCount}</p>
      </div>

      <!-- Only display seller info if this is not a user listings view -->
      ${!isUserListing ? `
          <p><strong>Seller Name:</strong> ${sellerName}</p>
          <p><strong>Seller Email:</strong> ${sellerEmail}</p>
      ` : ""}
    </div>
  `;
}

// Function to render the edit and delete buttons for a listing
function renderEditDeleteButtons(listing, shouldRender = false) {
  if (!shouldRender) {
    return "";
  }

  return `
    <div class="bg-Gallery flex justify-between max-w-4xl mx-auto p-6 shadow-lg">
      <button 
        class="editBtn"
        id="edit-btn-${listing.id}"
      >
        Edit
      </button>
      <button 
        class="deleteBtn"
        id="delete-btn-${listing.id}"
      >
        Delete
      </button>
    </div>
  `;
}

// Function to display the full details of a listing
export function displayDetailsListing(listing) {
  const listingContainer = document.getElementById("listing-container");
  listingContainer.innerHTML = renderListingDetails(listing) + renderEditDeleteButtons(listing, false);

  if (listing.media && listing.media.length > 1) {
    initializeCarousel(
      `carousel-items-${listing.id}`,
      `carousel-pagination-${listing.id}`
    );
  }
}

// Fetch user's listings from API
export async function fetchUserListings() {
  const apiUrl = `https://v2.api.noroff.dev/auction/profiles/${userName}/listings`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch listings:", responseBody);
      alert(
        `Failed to fetch listings: ${responseBody.message || "Unknown error"}`
      );
      return;
    }

    listingsArray = responseBody.data || responseBody;

    if (!Array.isArray(listingsArray)) {
      throw new Error("Listings data is not an array.");
    }

    const listingContainer = document.getElementById("listings-list");
    listingContainer.innerHTML = listingsArray
      .map((listing) => renderListingDetails(listing, true) + renderEditDeleteButtons(listing, true))
      .join("");

    listingsArray.forEach((listing) => {
      document.getElementById(`edit-btn-${listing.id}`).addEventListener("click", function () {
        openEditForm(listing.id);
      });

      document.getElementById(`delete-btn-${listing.id}`).addEventListener("click", function () {
        const confirmed = confirm("Are you sure you want to delete this listing?");
        if (confirmed) {
          deleteListing(listing.id);
        }
      });

      if (listing.media && listing.media.length > 1) {
        initializeCarousel(
          `carousel-items-${listing.id}`,
          `carousel-pagination-${listing.id}`
        );
      }
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    alert("There was an error fetching listings for this user. Please try again.");
  }
}

// Function to open the edit form with the listing's details
function openEditForm(listingId) {
  const listing = listingsArray.find((item) => item.id === listingId);

  if (listing) {
    document.getElementById("listing-id").value = listing.id;
    document.getElementById("edit-title").value = listing.title || '';
    document.getElementById("edit-description").value = listing.description || '';

    // Add extra space between media URLs for readability
    if (Array.isArray(listing.media) && listing.media.length > 0) {
      const mediaUrls = listing.media.map((media) => media.url).join("\n\n");
      document.getElementById("edit-media").value = mediaUrls;
    } else {
      document.getElementById("edit-media").value = ''; // Clear if no media
    }

    document.getElementById("edit-form-container").classList.remove("hidden");
  } else {
    console.error("Listing not found");
    alert("Listing not found!");
  }
}
