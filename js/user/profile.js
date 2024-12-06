import { apiKey } from "../constants/config.js"; // Correct path and extension
import { 
  deleteListing, 
  fetchUserProfileFromAPI, 
  fetchUserProfileData, 
  updateUserProfile, 
  createListingApi, 
  updateListingApi, 
  fetchUserListingsApi, 
} from "../modules/api.js";

const accessToken = localStorage.getItem('accessToken');
const userName = localStorage.getItem('userName');  // Assuming userName is stored in localStorage

// Fetch user profile data
async function fetchUserProfile() {
  if (!accessToken || !userName) {
    alert("You are not logged in. Please log in first.");
    return;
  }

  try {
    const profileData = await fetchUserProfileFromAPI(accessToken, userName, apiKey);
    const { name, bio, avatar, banner, listings, credits } = profileData;

    // Display profile information
    document.getElementById('user-credits-header').textContent = `Credits: ${credits || 0}`;
    document.getElementById('user-credits-profile').textContent = `Credits: ${credits || 0}`;
    document.getElementById('banner-img').src = banner?.url || '/templates/auth/posts/user/default-banner.jpg';
    document.getElementById('avatar-img').src = avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';
    document.getElementById('user-name').textContent = name || 'Unknown Name';
    document.getElementById('user-email').textContent = userName || 'Username not available';
    document.getElementById('user-bio').textContent = bio || 'No bio available';

    // Handle listings
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
      await fetchUserListings();
    }
  } catch (error) {
    console.error("Error:", error.message);
    alert("There was an error loading your profile. Please try again.");
  }
}

// Handle avatar display
async function handleAvatar() {
  const userIcon = document.getElementById('user-icon');
  if (!accessToken || !userName) {
    userIcon.innerHTML = `<a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>`;
    return;
  }

  try {
    const profileData = await fetchUserProfileData(accessToken, userName, apiKey);
    const avatarUrl = profileData.avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';

    userIcon.innerHTML = `<a href="/templates/auth/posts/user/profile.html"><img src="${avatarUrl}" alt="User Profile" class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';"></a>`;
    
    if (profileData.avatar?.url) {
      localStorage.setItem('avatar', profileData.avatar.url);
    }
  } catch (error) {
    console.error("Error:", error.message);
    userIcon.innerHTML = `<a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>`;
  }
}

// Edit profile functionality
async function editProfile() {
  const editAvatarBtn = document.getElementById('edit-avatar-btn');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const editProfileForm = document.getElementById('edit-profile-form');

  editAvatarBtn.addEventListener('click', () => {
    editProfileModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    editProfileModal.classList.add('hidden');
  });

  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const bio = document.getElementById('bio').value;
    const avatarUrl = document.getElementById('avatar-url').value;
    const bannerUrl = document.getElementById('banner-url').value;

    const requestBody = {
      bio: bio || "", 
      avatar: { url: avatarUrl || "", alt: "Updated Avatar" },
      banner: { url: bannerUrl || "", alt: "Updated Banner" }
    };

    try {
      const updatedProfile = await updateUserProfile(accessToken, userName, apiKey, requestBody);

      const newAvatarUrl = updatedProfile.avatar?.url || document.getElementById('avatar-img').src;
      const newBannerUrl = updatedProfile.banner?.url || document.getElementById('banner-img').src;

      document.getElementById('avatar-img').src = newAvatarUrl;
      document.getElementById('banner-img').src = newBannerUrl;
      document.getElementById('user-bio').textContent = updatedProfile.bio || 'No bio available';

      localStorage.removeItem('userAvatar');
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

// Create listing functionality
async function createListing() {
  const createListingBtn = document.getElementById('create-listing-btn');
  const createListingModal = document.getElementById('create-listing-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const createListingForm = document.getElementById('create-listing-form');

  createListingBtn.addEventListener('click', () => {
    createListingModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    createListingModal.classList.add('hidden');
  });

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
      alert("The 'Ends At' date must be a future date within one year from now.");
      return;
    }

    endsAt = endsAtDate.toISOString();

    const media = mediaUrls.length > 0 
      ? mediaUrls.map(url => ({ url, alt: 'Listing Media' })) 
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
      createListingModal.classList.add('hidden');
      location.reload();
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(error.message);
    }
  });
}

// Initialize all necessary functionalities
document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();
  handleAvatar();
  editProfile();
  createListing();
});

let listingsArray = [];

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM is loaded.");
  fetchUserListings();

  const saveButton = document.getElementById('save-edit-button');
  if (saveButton) {
    saveButton.addEventListener('click', function (event) {
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

function openEditForm(listingId) {
  const listing = listingsArray.find(item => item.id === listingId);

  if (listing) {
    document.getElementById('listing-id').value = listing.id;
    document.getElementById('edit-title').value = listing.title;
    document.getElementById('edit-description').value = listing.description;
    document.getElementById('edit-tags').value = listing.tags.join(', ');
    document.getElementById('edit-media-urls').value = listing.mediaUrls.join('\n');
    document.getElementById('edit-endsAt').value = listing.endsAt;
    document.getElementById('edit-listing-form').style.display = 'block';
  }
}

async function updateListing(listingId) {
  const updatedListing = {
    title: document.getElementById('edit-title').value,
    description: document.getElementById('edit-description').value,
    tags: document.getElementById('edit-tags').value.split(',').map(tag => tag.trim()),
    mediaUrls: document.getElementById('edit-media-urls').value.split('\n').map(url => url.trim()).filter(url => url),
    endsAt: document.getElementById('edit-endsAt').value,
  };

  try {
    await updateListingApi(listingId, updatedListing);
    alert('Listing updated successfully!');
    location.reload();
  } catch (error) {
    alert('Error updating listing: ' + error.message);
  }
}


async function fetchUserListings() {
  try {
    const listings = await fetchUserListingsApi(accessToken, userName);
    listingsArray = listings; // Store listings for future reference
    const listingsContainer = document.getElementById('listings-container');

    listingsContainer.innerHTML = listings.map(listing => `
      <div class="listing-item">
        <h3>${listing.title}</h3>
        <p>${listing.description}</p>
        <p>Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
        <button onclick="openEditForm(${listing.id})">Edit</button>
        <button onclick="deleteListing(${listing.id})">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    alert('Error fetching listings: ' + error.message);
  }
}
