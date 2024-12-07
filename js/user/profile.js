// Import statements
import { apiKey } from "../constants/config.js"; // Correct path and extension
import {
  fetchUserProfileData,
  updateUserProfile,
  createListingApi,
} from "../modules/api.js";
import { fetchUserListings, fetchUserProfile } from "../pages/listings.js";

// Local storage variables
const accessToken = localStorage.getItem('accessToken');
const userName = localStorage.getItem('userName'); // Assuming userName is stored in localStorage
let listingsArray = []; // Listings array

// Profile avatar handling
async function handleAvatar() {
  const userIcon = document.getElementById('user-icon');
  if (!accessToken || !userName) {
    userIcon.innerHTML = `
      <a href="/templates/auth/login.html">
        <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
      </a>`;
    return;
  }

  try {
    const profileData = await fetchUserProfileData(accessToken, userName, apiKey);
    const avatarUrl = profileData.avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';

    userIcon.innerHTML = `
      <a href="/templates/auth/posts/user/profile.html">
        <img src="${avatarUrl}" alt="User Profile" 
          class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue"
          onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';">
      </a>`;

    if (profileData.avatar?.url) {
      localStorage.setItem('avatar', profileData.avatar.url);
    }
  } catch (error) {
    console.error("Error:", error.message);
    userIcon.innerHTML = `
      <a href="/templates/auth/login.html">
        <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
      </a>`;
  }
}

// Edit profile functionality
async function editProfile() {
  const editAvatarBtn = document.getElementById('edit-avatar-btn');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const editProfileForm = document.getElementById('edit-profile-form');

  editAvatarBtn.addEventListener('click', () => editProfileModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => editProfileModal.classList.add('hidden'));

  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const bio = document.getElementById('bio').value;
    const avatarUrl = document.getElementById('avatar-url').value;
    const bannerUrl = document.getElementById('banner-url').value;

    const requestBody = {
      bio: bio || "",
      avatar: { url: avatarUrl || "", alt: "Updated Avatar" },
      banner: { url: bannerUrl || "", alt: "Updated Banner" },
    };

    try {
      const updatedProfile = await updateUserProfile(accessToken, userName, apiKey, requestBody);

      const newAvatarUrl = updatedProfile.avatar?.url || document.getElementById('avatar-img').src;
      const newBannerUrl = updatedProfile.banner?.url || document.getElementById('banner-img').src;

      document.getElementById('avatar-img').src = newAvatarUrl;
      document.getElementById('banner-img').src = newBannerUrl;
      document.getElementById('user-bio').textContent = updatedProfile.bio || 'No bio available';

      localStorage.setItem('userAvatar', newAvatarUrl);
      localStorage.setItem('userBanner', newBannerUrl);

      editProfileModal.classList.add('hidden');
      alert('Profile updated successfully!');
      location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
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
    const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Noroff-API-Key': apiKey,
      },
    });

    if (!response.ok) throw new Error('Error fetching user profile.');
    const profileData = await response.json();
    const { credits } = profileData.data;
    localStorage.setItem('userCredits', credits || 0);
  } catch (error) {
    console.error("Error fetching credits:", error);
    alert("There was an error fetching credits. Please try again.");
  }
}

// Create listing functionality
async function createListing() {
  const createListingBtn = document.getElementById('create-listing-btn');
  const createListingModal = document.getElementById('create-listing-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const createListingForm = document.getElementById('create-listing-form');

  createListingBtn.addEventListener('click', () => createListingModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => createListingModal.classList.add('hidden'));

  createListingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const mediaUrls = document.getElementById('media-urls').value.split('\n').map(url => url.trim()).filter(url => url);
    let endsAt = document.getElementById('endsAt').value;

    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setFullYear(currentDate.getFullYear() + 1);
    const endsAtDate = new Date(endsAt);

    if (endsAtDate <= currentDate || endsAtDate > maxDate) {
      alert("The 'Ends At' date must be valid and within one year.");
      return;
    }

    endsAt = endsAtDate.toISOString();
    const media = mediaUrls.length > 0 
      ? mediaUrls.map(url => ({ url, alt: 'Listing Media' })) 
      : [];

    const requestBody = { title, description, tags: tags.length > 0 ? tags : undefined, media, endsAt };

    try {
      const result = await createListingApi(accessToken, apiKey, requestBody);
      alert("Listing created successfully!");
      createListingModal.classList.add('hidden');
      location.reload();
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(error.message);
    }
  });
}

// Edit listing functionality
async function updateListing(listingId) {
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const mediaUrl = document.getElementById('edit-media').value;

  const data = {
    title,
    description,
    media: mediaUrl ? [{ url: mediaUrl, alt: 'Updated Image' }] : [],
  };

  try {
    const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Noroff-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (response.ok) {
      alert('Listing updated successfully!');
      closeEditForm();
      fetchUserListings();
    } else {
      alert(`Error: ${responseData.message || 'Unknown error occurred'}`);
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    alert('An error occurred while updating the listing.');
  }
}

function closeEditForm() {
  document.getElementById('edit-form-container').classList.add('hidden');
}

// Initialize all functionalities
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM is loaded.");
  fetchUserProfile();
  handleAvatar();
  editProfile();
  fetchAndStoreCredits();
  createListing();
  fetchUserListings();

  const saveButton = document.getElementById('save-edit-button');
  if (saveButton) {
    saveButton.addEventListener('click', (event) => {
      event.preventDefault();
      const listingId = document.getElementById('listing-id').value;
      updateListing(listingId);
    });
  }

  const cancelButton = document.getElementById('cancel-edit-button');
  if (cancelButton) {
    cancelButton.addEventListener('click', closeEditForm);
  }
});
