// Import statements
import { apiKey } from "../constants/config.js"; // Import API key from config
import {
  fetchUserProfileData,
  fetchUserWins,
  updateUserProfile,
  createListingApi,
  updateListingApi,
  fetchUserCreditsApi,
  handleAvatar,
  getUserProfileData,
} from "../modules/api.js"; // Import various API functions
import { fetchUserListings } from "../pages/listings.js"; // Import function to fetch user listings
import { initMobileMenu } from "../modules/utilit.js"; // Import function to initialize mobile menu

// Local storage variables
const accessToken = localStorage.getItem("accessToken"); // Get access token from localStorage
const userName = localStorage.getItem("userName"); // Get username from localStorage
let listingsArray = []; // Initialize an empty array for user listings

// Edit profile functionality
async function editProfile() {
  const editAvatarBtn = document.getElementById("edit-avatar-btn"); // Button to edit avatar
  const editProfileModal = document.getElementById("edit-profile-modal"); // Modal for editing profile
  const closeModalBtn = document.getElementById("close-modal"); // Button to close modal
  const editProfileForm = document.getElementById("edit-profile-form"); // Form to edit profile

  // Show the profile edit modal when the edit avatar button is clicked
  editAvatarBtn.addEventListener("click", () =>
    editProfileModal.classList.remove("hidden")
  );

  // Close the modal when the close button is clicked
  closeModalBtn.addEventListener("click", () =>
    editProfileModal.classList.add("hidden")
  );

  // Handle form submission for editing the profile
  editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get values from the form inputs
    const bio = document.getElementById("bio").value;
    const avatarUrl = document.getElementById("avatar-url").value;
    const bannerUrl = document.getElementById("banner-url").value;

    // Prepare the request body for updating the profile
    const requestBody = {
      bio: bio || "",
      avatar: { url: avatarUrl || "", alt: "Updated Avatar" },
      banner: { url: bannerUrl || "", alt: "Updated Banner" },
    };

    try {
      // Make an API request to update the user profile
      const updatedProfile = await updateUserProfile(
        accessToken,
        userName,
        apiKey,
        requestBody
      );

      // Update the displayed profile with new avatar and banner
      const newAvatarUrl =
        updatedProfile.avatar?.url || document.getElementById("avatar-img").src;
      const newBannerUrl =
        updatedProfile.banner?.url || document.getElementById("banner-img").src;

      document.getElementById("avatar-img").src = newAvatarUrl;
      document.getElementById("banner-img").src = newBannerUrl;
      document.getElementById("user-bio").textContent =
        updatedProfile.bio || "No bio available";

      // Store the updated avatar and banner URLs in localStorage
      localStorage.setItem("userAvatar", newAvatarUrl);
      localStorage.setItem("userBanner", newBannerUrl);

      // Hide the modal and alert the user of success
      editProfileModal.classList.add("hidden");
      alert("Profile updated successfully!");
      location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error("Error updating profile:", error); // Log any errors
      alert("An error occurred while updating the profile.");
    }
  });
}

// Handle credits
async function fetchAndStoreCredits() {
  // Check if the user is logged in
  if (!accessToken || !userName) {
    alert("You are not logged in. Please log in first.");
    return;
  }

  try {
    // Fetch user credits from the API
    const credits = await fetchUserCreditsApi(userName, accessToken, apiKey);
    localStorage.setItem("userCredits", credits || 0); // Store the credits in localStorage
  } catch (error) {
    console.error("Error fetching credits:", error); // Log any errors
    alert("There was an error fetching credits. Please try again.");
  }
}

// Create listing functionality
async function createListing() {
  const createListingBtn = document.getElementById("create-listing-btn"); // Button to open the create listing modal
  const createListingModal = document.getElementById("create-listing-modal"); // Modal to create listing
  const closeCreateListingModalBtn = document.getElementById(
    "close-create-listing-modal"
  ); // Button to close the modal
  const createListingForm = document.getElementById("create-listing-form"); // Form to submit listing details

  // Open the create listing modal
  createListingBtn.addEventListener("click", () =>
    createListingModal.classList.remove("hidden")
  );

  // Close the create listing modal
  closeCreateListingModalBtn.addEventListener("click", () =>
    createListingModal.classList.add("hidden")
  );

  // Handle form submission for creating a new listing
  createListingForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get values from the form inputs
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const mediaUrls = document
      .getElementById("media-urls")
      .value.split("\n")
      .map((url) => url.trim())
      .filter((url) => url);
    let endsAt = document.getElementById("endsAt").value;

    // Validate the 'Ends At' date
    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setFullYear(currentDate.getFullYear() + 1); // Max date is one year from now
    const endsAtDate = new Date(endsAt);

    if (endsAtDate <= currentDate || endsAtDate > maxDate) {
      alert("The 'Ends At' date must be valid and within one year.");
      return;
    }

    endsAt = endsAtDate.toISOString(); // Convert the endsAt date to ISO format
    const media =
      mediaUrls.length > 0
        ? mediaUrls.map((url) => ({ url, alt: "Listing Media" }))
        : []; // Prepare media URLs for the listing

    // Prepare the request body
    const requestBody = {
      title,
      description,
      tags: tags.length > 0 ? tags : undefined,
      media,
      endsAt,
    };

    try {
      // Make an API request to create the listing
      const result = await createListingApi(accessToken, apiKey, requestBody);
      alert("Listing created successfully!");
      createListingModal.classList.add("hidden");
      location.reload(); // Reload the page to reflect the new listing
    } catch (error) {
      console.error("Error creating listing:", error); // Log any errors
      alert(error.message);
    }
  });
}

// Edit listing functionality
async function updateListing(listingId) {
  const title = document.getElementById("edit-title").value; // Get the new title
  const description = document.getElementById("edit-description").value; // Get the new description

  // Split media URLs into an array
  const mediaUrls = document
    .getElementById("edit-media")
    .value.split("\n")
    .map((url) => url.trim())
    .filter((url) => url);

  // Prepare the data object
  const data = {
    title,
    description,
    media: mediaUrls.map((url) => ({ url, alt: "Updated Image" })),
  };

  try {
    // Make an API request to update the listing
    const responseData = await updateListingApi(
      listingId,
      accessToken,
      apiKey,
      data
    );
    alert("Listing updated successfully!");
    closeEditForm(); // Close the edit form
    fetchUserListings(); // Refresh the listings on the page
  } catch (error) {
    console.error("Error updating listing:", error); // Log any errors
    alert(`An error occurred: ${error.message}`);
  }
}

// Function to close the edit form
function closeEditForm() {
  document.getElementById("edit-form-container").classList.add("hidden");
}

// Initialize all functionalities when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadAndDisplayUserProfile(); // Load and display the user's profile
  handleAvatar(); // Handle the user's avatar
  editProfile(); // Initialize the profile editing functionality
  fetchAndStoreCredits(); // Fetch and store the user's credits
  createListing(); // Initialize the listing creation functionality
  fetchUserListings(); // Fetch and display user listings

  // Event listener for saving an edited listing
  const saveButton = document.getElementById("save-edit-button");
  if (saveButton) {
    saveButton.addEventListener("click", (event) => {
      event.preventDefault();
      const listingId = document.getElementById("listing-id").value;
      updateListing(listingId);
    });
  }

  // Event listener for canceling an edit
  const cancelButton = document.getElementById("cancel-edit-button");
  if (cancelButton) {
    cancelButton.addEventListener("click", closeEditForm);
  }
});

// Fetch the user wins and display them
async function loadUserWins() {
  const accessToken = localStorage.getItem("accessToken"); // Get the access token from localStorage
  if (!accessToken) {
    console.error("No access token found");
    return;
  }

  const profileName = localStorage.getItem("userName"); // Example profile name (could be dynamic)
  const wins = await fetchUserWins(profileName, accessToken);
  displayWins(wins); // Display the fetched wins
}

// Function to display auction wins
export function displayWins(wins) {
  const winsContainer = document.getElementById("wins-container");
  if (!winsContainer) {
    console.error("Wins container not found in the DOM!"); // Log if the container is not found
    return;
  }

  // Clear the previous content in the container
  winsContainer.innerHTML = "";

  // If no wins, display the new personalized message
  if (!wins || wins.length === 0) {
    winsContainer.innerHTML = "<p>You have no wins yet.</p>";
    return;
  }

  // Iterate over each win and display its details
  wins.forEach((win) => {
    const winElement = document.createElement("div");
    winElement.classList.add(
      "win-card",
      "bg-white",
      "shadow-lg",
      "mb-6",
      "p-3",
      "flex",
      "flex-col",
      "h-full"
    );

    // Handle missing media or fallback image
    const imageUrl =
      win.media && win.media.length > 0
        ? win.media[0].url
        : "default-image.jpg";
    const imageAlt = win.title || "Auction Item";
    const listingId = win.id; // The listing ID for the link

    // Dynamically generate the URL for the listing details page
    const listingUrl = `/templates/auth/posts/details.html?listingId=${listingId}`;

    // Construct the HTML content for the win
    winElement.innerHTML = `
            <a href="${listingUrl}" class="win-link">
                <div class="relative">
                    <!-- Won label -->
                    <div class="winBar">
                        Won!
                    </div>
                    <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover" />
                    <div class="win-info p-3">
                        <h3 class="win-title text-xl font-semibold">${
                          win.title
                        }</h3>
                        <p class="win-description">${win.description}</p>
                        <span class="win-created text-sm text-gray-500">Won on: ${new Date(
                          win.created
                        ).toLocaleDateString()}</span>
                    </div>
                </div>
            </a>
        `;

    // Append the win element to the container
    winsContainer.appendChild(winElement);
  });
}

// Load and display user profile when the page loads
export async function loadAndDisplayUserProfile() {
  if (!accessToken || !userName) {
    alert("You are not logged in. Please log in first.");
    return;
  }

  try {
    // Fetch the user profile data using the new API function
    const profileData = await getUserProfileData(userName, accessToken);

    const { name, bio, avatar, banner, listings, credits } = profileData;

    // Update the profile information on the page
    document.getElementById("user-credits-header").textContent = `Credits: ${
      credits || 0
    }`;
    document.getElementById("user-credits-profile").textContent = `Credits: ${
      credits || 0
    }`;
    document.getElementById("banner-img").src =
      banner?.url || "/templates/auth/posts/user/default-banner.jpg";
    document.getElementById("avatar-img").src =
      avatar?.url || "/templates/auth/posts/user/default-avatar.jpg";
    document.getElementById("user-name").textContent = name || "Unknown Name";
    document.getElementById("user-email").textContent =
      userName || "Username not available";
    document.getElementById("user-bio").textContent = bio || "No bio available";

    // Display the user's listings
    const listingsList = document.getElementById("listings-list");
    if (listings && listings.length > 0) {
      listingsList.innerHTML = listings
        .map(
          (listing) => `
                <li class="listing-item">
                    <div class="listing-title"><strong>${
                      listing.title
                    }</strong></div>
                    <div class="listing-description">${
                      listing.description || "No description available"
                    }</div>
                    <div class="listing-created">Created: ${new Date(
                      listing.created
                    ).toLocaleDateString()}</div>
                    <div class="listing-endsAt">Ends: ${new Date(
                      listing.endsAt
                    ).toLocaleDateString()}</div>
                </li>
            `
        )
        .join("");
    } else {
      await fetchUserListings(); // If no listings, fetch user listings from the API
    }
  } catch (error) {
    console.error("Error loading and displaying user profile:", error); // Log any errors
    alert("There was an error loading your profile. Please try again.");
  }
}

// Call the function to load and display user wins when the page loads
loadUserWins();

// Initialize the mobile menu
initMobileMenu();
