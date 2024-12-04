import { apiKey } from "../../constants/config.js"; // Correct path and extension



const accessToken = localStorage.getItem('accessToken');
const userName = localStorage.getItem('userName');  // Assuming userName is stored in localStorage

// Fetch and display profile data (simplified)
// Fetch and display profile data
async function fetchUserProfile() {
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
        console.log('Profile Data:', profileData);

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



// Profile avatar handling
async function handleAvatar() {
    const userIcon = document.getElementById('user-icon');
    if (!accessToken || !userName) {
        userIcon.innerHTML = `<a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>`;
        return;
    }

    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Noroff-API-Key': apiKey },
        });

        const profileData = await response.json();
        const avatarUrl = profileData.data.avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';

        // Update UI with avatar
        userIcon.innerHTML = `<a href="/templates/auth/posts/user/profile.html"><img src="${avatarUrl}" alt="User Profile" class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';"></a>`;
        
        // Store avatar in localStorage
        if (profileData.data.avatar?.url) {
            localStorage.setItem('avatar', profileData.data.avatar.url);
        }
    } catch (error) {
        console.error("Error fetching profile data:", error);
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

    // Handle profile update
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
            const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Noroff-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                // Update profile UI
                const newAvatarUrl = updatedProfile.data.avatar?.url || document.getElementById('avatar-img').src;
                const newBannerUrl = updatedProfile.data.banner?.url || document.getElementById('banner-img').src;
                
                // Update profile images on the page
                document.getElementById('avatar-img').src = newAvatarUrl;
                document.getElementById('banner-img').src = newBannerUrl;
                document.getElementById('user-bio').textContent = updatedProfile.data.bio || 'No bio available';
                
                // Clear old avatar from localStorage and store the new one
                localStorage.removeItem('userAvatar');
                localStorage.setItem('userAvatar', newAvatarUrl);
                
                // Optionally store the banner if needed
                localStorage.setItem('userBanner', newBannerUrl);
                
                // Hide the modal and reload the page to reflect changes
                editProfileModal.classList.add('hidden');
                alert('Profile updated successfully!');
                
                // Reload the page to reflect changes
                location.reload(); // This will reload the page to reflect the updated profile
            } else {
                console.error('Error updating profile');
                alert('Failed to update the profile.');
            }
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

    // Handle listing creation
    createListingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const mediaUrls = document.getElementById('media-urls').value.split('\n').map(url => url.trim()).filter(url => url); // Split by new lines
        let endsAt = document.getElementById('endsAt').value;

        // Ensure endsAt is a valid future date within one year
        const currentDate = new Date();
        const maxDate = new Date(currentDate);
        maxDate.setFullYear(currentDate.getFullYear() + 1); // Set maxDate to 1 year ahead

        // Convert endsAt to a Date object
        const endsAtDate = new Date(endsAt);

        if (endsAtDate <= currentDate) {
            alert("The 'Ends At' date must be a future date.");
            return; // Stop form submission if the date is in the past
        }

        if (endsAtDate > maxDate) {
            alert("The 'Ends At' date must be within one year from now.");
            return; // Stop form submission if the date is more than one year ahead
        }

        // Format endsAt to ISO 8601 if valid
        endsAt = endsAtDate.toISOString();

        // Prepare media data for request body
        const media = mediaUrls.length > 0 
            ? mediaUrls.map(url => ({ url, alt: 'Listing Media' })) 
            : []; // Create media objects only if URLs are provided

        const requestBody = {
            title,
            description,
            tags: tags.length > 0 ? tags : undefined, // Only include tags if there are any
            media, // Include media if URLs are provided
            endsAt,
        };

        console.log("Request Body:", requestBody); // Log request body for debugging

        try {
            const response = await fetch('https://v2.api.noroff.dev/auction/listings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Noroff-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                alert("Listing created successfully!");
                createListingModal.classList.add('hidden');
                location.reload();
            } else {
                const errorDetails = await response.json(); // Retrieve error details
                console.error("Error response:", JSON.stringify(errorDetails, null, 2)); // Log the full error response
                alert("There was an error creating the listing: " + JSON.stringify(errorDetails.errors, null, 2));
            }
        } catch (error) {
            console.error("Error creating listing:", error);
            alert("Network error occurred while creating the listing.");
        }
    });
}




// Initialize all necessary functionalities
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    handleAvatar();
    editProfile();
    fetchAndStoreCredits();
    createListing();
});



//---------------------------------------------------------------

















let listingsArray = []; // Listings array

// Ensure the page is fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM is loaded.");
    fetchUserListings();  // Fetch user listings when the page loads

    // Listen for clicks on the "Save" button
    const saveButton = document.getElementById('save-edit-button'); // Ensure this button exists in HTML
    if (saveButton) {
        saveButton.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default form submission (page reload)
            const listingId = document.getElementById('listing-id').value;  // Get the listing ID from hidden input
            updateListing(listingId);  // Trigger the update process when clicked
        });
    }

    // Listen for "Cancel" button to close the edit form
    const cancelButton = document.getElementById('cancel-edit-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeEditForm);
    }
});

// Open the edit form and populate it with listing data
function openEditForm(listingId) {
    console.log('Opening edit form for listing ID:', listingId); // Debug log
    const listing = listingsArray.find(item => item.id === listingId);

    if (listing) {
        console.log('Found listing:', listing); // Debug log

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

// Close the edit form
function closeEditForm() {
    document.getElementById('edit-form-container').classList.add('hidden');
}

// Function to update the listing with the new data
async function updateListing(listingId) {
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-description').value;
    const mediaUrl = document.getElementById('edit-media').value;  // Assuming media URL input

    // Prepare the data to be sent in the PUT request
    const data = {
        title: title,
        description: description,
        media: mediaUrl ? [{ url: mediaUrl, alt: 'Updated Image' }] : [] // Handle optional media URL
    };

    // Log the data being sent to verify it's correct
    console.log('Data to send:', data);

    try {
        // Send PUT request to update the listing
        const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Ensure valid access token
                'X-Noroff-API-Key': apiKey, // Ensure valid API key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Parse response and handle success/failure
        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (response.ok) {
            // If successful, update the UI or inform the user
            alert('Listing updated successfully!');
            closeEditForm();  // Close the form after successful update
            fetchUserListings();  // Optionally, refresh the listings
        } else {
            // Handle errors
            alert(`Error: ${responseData.message || 'Unknown error occurred'}`);
        }
    } catch (error) {
        console.error('Network or unexpected error:', error);
        alert('An error occurred while updating the listing.');
    }
}

// Fetch user listings function
async function fetchUserListings() {
    const apiUrl = `https://v2.api.noroff.dev/auction/profiles/${userName}/listings`;

    try {
        console.log('Fetching user listings...');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
            },
        });

        const responseBody = await response.json();
        console.log('Listings Data:', responseBody);

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
            <li class="bg-white shadow-md rounded-lg overflow-hidden mb-6 border border-gray-200" id="listing-${listing.id}">
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
                        class="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
                        id="edit-btn-${listing.id}"
                    >
                        Edit
                    </button>
                    <button 
                        class="bg-red-500 text-white px-4 py-2 rounded mt-2 hover:bg-red-600"
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


// Function to delete a listing
async function deleteListing(listingId) {
    const apiUrl = `https://v2.api.noroff.dev/auction/listings/${listingId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
            }
        });

        if (response.ok) {
            alert("Listing deleted successfully!");
            // Refresh the listings after deletion
            fetchUserListings();
        } else {
            const errorData = await response.json();
            console.error("Error deleting listing:", errorData);
            alert("Failed to delete the listing.");
        }
    } catch (error) {
        console.error("Error deleting listing:", error);
        alert("There was an error deleting the listing. Please try again.");
    }
}





//-----------------------------------------------------------------------------------------------------------------







const apiUrl = "https://v2.api.noroff.dev/";

// Function to fetch auction wins by profile name
async function fetchUserWinsByProfile(profileName, page = 1) {
  try {
    const token = localStorage.getItem('accessToken'); // Get the access token from localStorage
    if (!token) {
      console.error("No access token found in localStorage.");
      alert("Please log in to view your wins.");
      return;
    }

    console.log("Access Token:", token);

    // Construct the URL with pagination support
    const url = `${apiUrl}auction/profiles/${profileName}/wins?page=${page}`;

    // Fetch the auction wins for the specified profile
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Bearer token for authentication
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': apiKey || '', // Assuming apiKey is defined elsewhere if necessary
      },
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error(`Failed to fetch user wins: ${errorResponse}`);
      
      if (response.status === 401) {
        alert("Unauthorized. Please log in again.");
        // Optionally, redirect to login page or clear stored token
      } else if (response.status === 404) {
        alert("Profile not found. Please check the username or log in with the correct account.");
      }
      return;
    }

    const winsData = await response.json();
    console.log("User Wins Data:", winsData);

    const wins = winsData.data || []; // Ensure wins is an array
    const meta = winsData.meta || {}; // Meta data for pagination

    // Call the function to display the wins
    displayWins(wins);

    // Return meta for pagination
    return meta;
  } catch (error) {
    console.error("Error fetching user wins:", error);
  }
}

// Function to display auction wins
function displayWins(wins) {
  const winsContainer = document.getElementById('wins-container');
  winsContainer.innerHTML = ''; // Clear any previous content

  if (!wins || wins.length === 0) {
    winsContainer.innerHTML = '<p>No wins available.</p>';
    return;
  }

  wins.forEach(win => {
    const winElement = document.createElement('div');
    winElement.classList.add('win-card', 'bg-white', 'shadow-lg', 'mb-6', 'p-3', 'flex', 'flex-col', 'h-full');

    const imageUrl = win.media && win.media[0] ? win.media[0].url : ''; // Handle missing images
    const imageAlt = win.title || 'Auction Item';
    const listingId = win.id; // Get the listing ID for the link

    // Dynamically generate the URL
    const listingUrl = `/templates/auth/posts/details.html?listingId=${listingId}`;

    // Create the HTML structure for each win, wrapped in a clickable link
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

    // Append the win card to the wins container
    winsContainer.appendChild(winElement);
  });
}

// Function to load more wins on button click
let currentPage = 1;
let totalPages = 1; // Assuming only 1 page at the beginning

document.getElementById('load-more-button').addEventListener('click', async function () {
  // Check if there are more pages to load
  if (currentPage < totalPages) {
    currentPage += 1;
    const profileName = localStorage.getItem('userName'); // Fetch the profile name from localStorage
    const meta = await fetchUserWinsByProfile(profileName, currentPage);
    totalPages = meta.pageCount; // Update total pages for pagination
  } else {
    alert('No more wins to load.');
  }
});

// Initial fetch of user wins
document.addEventListener("DOMContentLoaded", async function() {
  const profileName = localStorage.getItem('userName'); // Retrieve the profile name from localStorage
  if (!profileName) {
    console.error("No profile name found in localStorage.");
    alert("Please log in to view your wins.");
    return;
  }
  
  const meta = await fetchUserWinsByProfile(profileName, currentPage);
  totalPages = meta ? meta.pageCount : 1; // Set total pages for pagination (in case `meta` is undefined)
});
