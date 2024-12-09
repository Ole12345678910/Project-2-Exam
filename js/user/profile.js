// Import statements
import { apiKey } from "../constants/config.js"; // Correct path and extension
import {
  fetchUserProfileData,
  updateUserProfile,
  createListingApi,
  updateListingApi,
  fetchUserCreditsApi,
  fetchUserWins,
  handleAvatar,
} from "../modules/api.js";
import {
  fetchUserListings,
  fetchUserProfile,
  displayWins,
} from "../pages/listings.js";
import { initMobileMenu } from "../modules/utilit.js";

// Local storage variables
const accessToken = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName"); // Assuming userName is stored in localStorage
let listingsArray = []; // Listings array

// Edit profile functionality
async function editProfile() {
  const editAvatarBtn = document.getElementById("edit-avatar-btn");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const editProfileForm = document.getElementById("edit-profile-form");

  editAvatarBtn.addEventListener("click", () =>
    editProfileModal.classList.remove("hidden")
  );
  closeModalBtn.addEventListener("click", () =>
    editProfileModal.classList.add("hidden")
  );

  editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const bio = document.getElementById("bio").value;
    const avatarUrl = document.getElementById("avatar-url").value;
    const bannerUrl = document.getElementById("banner-url").value;

    const requestBody = {
      bio: bio || "",
      avatar: { url: avatarUrl || "", alt: "Updated Avatar" },
      banner: { url: bannerUrl || "", alt: "Updated Banner" },
    };

    try {
      const updatedProfile = await updateUserProfile(
        accessToken,
        userName,
        apiKey,
        requestBody
      );

      const newAvatarUrl =
        updatedProfile.avatar?.url || document.getElementById("avatar-img").src;
      const newBannerUrl =
        updatedProfile.banner?.url || document.getElementById("banner-img").src;

      document.getElementById("avatar-img").src = newAvatarUrl;
      document.getElementById("banner-img").src = newBannerUrl;
      document.getElementById("user-bio").textContent =
        updatedProfile.bio || "No bio available";

      localStorage.setItem("userAvatar", newAvatarUrl);
      localStorage.setItem("userBanner", newBannerUrl);

      editProfileModal.classList.add("hidden");
      alert("Profile updated successfully!");
      location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  });
}

// Handle credits
async function fetchAndStoreCredits() {
  if (!accessToken || !userName) {
    alert("You are not logged in. Please log in first.");
    return;
  }

  try {
    const credits = await fetchUserCreditsApi(userName, accessToken, apiKey);
    localStorage.setItem("userCredits", credits || 0);
  } catch (error) {
    console.error("Error fetching credits:", error);
    alert("There was an error fetching credits. Please try again.");
  }
}

// Create listing functionality
async function createListing() {
  const createListingBtn = document.getElementById("create-listing-btn");
  const createListingModal = document.getElementById("create-listing-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const createListingForm = document.getElementById("create-listing-form");

  createListingBtn.addEventListener("click", () =>
    createListingModal.classList.remove("hidden")
  );
  closeModalBtn.addEventListener("click", () =>
    createListingModal.classList.add("hidden")
  );

  createListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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

    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setFullYear(currentDate.getFullYear() + 1);
    const endsAtDate = new Date(endsAt);

    if (endsAtDate <= currentDate || endsAtDate > maxDate) {
      alert("The 'Ends At' date must be valid and within one year.");
      return;
    }

    endsAt = endsAtDate.toISOString();
    const media =
      mediaUrls.length > 0
        ? mediaUrls.map((url) => ({ url, alt: "Listing Media" }))
        : [];

    const requestBody = {
      title,
      description,
      tags: tags.length > 0 ? tags : undefined,
      media,
      endsAt,
    };

    try {
      const result = await createListingApi(accessToken, apiKey, requestBody);
      alert("Listing created successfully!");
      createListingModal.classList.add("hidden");
      location.reload();
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(error.message);
    }
  });
}

// Edit listing functionality
async function updateListing(listingId) {
  const title = document.getElementById("edit-title").value;
  const description = document.getElementById("edit-description").value;
  const mediaUrl = document.getElementById("edit-media").value;

  // Prepare the data object
  const data = {
    title,
    description,
    media: mediaUrl ? [{ url: mediaUrl, alt: "Updated Image" }] : [],
  };

  try {
    const responseData = await updateListingApi(
      listingId,
      accessToken,
      apiKey,
      data
    );
    alert("Listing updated successfully!");
    closeEditForm(); // Function to close the edit form
    fetchUserListings(); // Function to refresh the listings on the page
  } catch (error) {
    console.error("Error updating listing:", error);
    alert(`An error occurred: ${error.message}`);
  }
}
function closeEditForm() {
  document.getElementById("edit-form-container").classList.add("hidden");
}

// Initialize all functionalities
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM is loaded.");
  fetchUserProfile();
  handleAvatar();
  editProfile();
  fetchAndStoreCredits();
  createListing();
  fetchUserListings();

  const saveButton = document.getElementById("save-edit-button");
  if (saveButton) {
    saveButton.addEventListener("click", (event) => {
      event.preventDefault();
      const listingId = document.getElementById("listing-id").value;
      updateListing(listingId);
    });
  }

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

// Call the function to load and display user wins when the page loads
loadUserWins();
initMobileMenu();