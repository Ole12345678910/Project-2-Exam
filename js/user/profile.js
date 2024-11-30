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

// Fetch listings separately if needed
async function fetchUserListings() {
    try {
        // Assuming that listings are fetched based on user ID or a list of listing IDs.
        // You may need to fetch this from another endpoint if necessary
        const response = await fetch(`https://v2.api.noroff.dev/auction/listings/search?q=${userName}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
            },
        });

        if (!response.ok) throw new Error('Error fetching user listings.');

        const listingsData = await response.json();
        const listingsList = document.getElementById('listings-list');

        if (listingsData.data && listingsData.data.length > 0) {
            listingsList.innerHTML = listingsData.data.map(listing => `
                <li class="listing-item">
                    <div class="listing-title"><strong>${listing.title}</strong></div>
                    <div class="listing-description">${listing.description || 'No description available'}</div>
                    <div class="listing-created">Created: ${new Date(listing.created).toLocaleDateString()}</div>
                    <div class="listing-endsAt">Ends: ${new Date(listing.endsAt).toLocaleDateString()}</div>
                </li>
            `).join('');
        } else {
            listingsList.innerHTML = "<li>No listings available</li>";
        }
    } catch (error) {
        console.error("Error fetching user listings:", error);
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

        userIcon.innerHTML = `<a href="/templates/auth/posts/user/profile.html"><img src="${avatarUrl}" alt="User Profile" class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';"></a>`;
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
                document.getElementById('avatar-img').src = updatedProfile.data.avatar?.url || document.getElementById('avatar-img').src;
                document.getElementById('banner-img').src = updatedProfile.data.banner?.url || document.getElementById('banner-img').src;
                document.getElementById('user-bio').textContent = updatedProfile.data.bio || 'No bio available';
                localStorage.setItem('avatar', updatedProfile.data.avatar?.url);
                editProfileModal.classList.add('hidden');
                location.reload();
            } else {
                console.error('Error updating profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
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
        const mediaUrl = document.getElementById('media-url').value;
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

        const requestBody = {
            title,
            description,
            tags: tags.length > 0 ? tags : undefined, // Only include tags if there are any
            media: mediaUrl ? [{ url: mediaUrl, alt: 'Listing Media' }] : [], // Only include media if URL is provided
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
