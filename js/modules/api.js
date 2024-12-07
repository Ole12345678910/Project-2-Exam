import { apiUrl, apiKey } from "../constants/config.js";
import { displayCarousel } from "../pages/listings.js";
import { accessToken, userName } from "../pages/listings.js";

/**
 * Fetch data from the API.
 * A generic function for API calls to reduce repetitive code.
 */
async function fetchFromApi(endpoint, options = {}) {
  try {
    // Check if accessToken and apiKey are available and valid
    if (!accessToken || !apiKey) {
      console.error("Missing access token or API key");
      return;  // Or handle error appropriately
    }

    // Set headers dynamically, with Authorization and API Key
    const headers = {
      "Content-Type": "application/json",       // For JSON body
      "Authorization": `Bearer ${accessToken}`, // Authentication token
      "X-Noroff-API-Key": apiKey,               // API key for access control
      ...options.headers,                       // Merge any additional headers passed in options
    };

    // Make the API call
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: options.method || "GET",          // Default to GET if no method provided
      headers: headers,                         // Include the constructed headers
      body: options.body || undefined,          // Include the body (if any) for POST/PUT requests
    });

    // Handle non-OK response
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API response error data:", errorData);
      throw new Error(errorData.errors?.[0]?.message || `Error: ${response.status}`);
    }

    // Return parsed JSON response
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    throw error;
  }
}



// Fetch search results from the API
export async function fetchSearchResults(query) {
  const result = await fetchFromApi(`auction/listings/search?q=${encodeURIComponent(query)}`);
  return Array.isArray(result.data) ? result.data : [];
}

// Fetch random posts
export async function getRandomPosts(count = 4) {
  const result = await fetchFromApi("auction/listings");
  const listings = Array.isArray(result.data) ? result.data : [];
  displayPosts(getRandomItems(listings, count));
}

// Utility function to get random items from an array
export function getRandomItems(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
  return shuffled.slice(0, count); // Get the first 'count' items
}


// Fetch auction listings
export async function fetchAuctionListings() {
  const result = await fetchFromApi("auction/listings");
  displayCarousel(getTop3NewestListings(result.data));
}

// Display top 3 newest listings
function getTop3NewestListings(listings) {
  return listings.sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 3);
}

// Display posts dynamically
export function displayPosts(posts) {
  const postsContainer = document.getElementById("random-posts-container");
  postsContainer.innerHTML = posts
    .map((post) => {
      const imageUrl = post.media?.[0]?.url || null;
      if (!imageUrl) return "";
      return `
        <div class="flex justify-center items-center">
          <a href="/auction-details.html?listingId=${post.id}" class="block transform transition-transform hover:scale-110">
            <img src="${imageUrl}" alt="${post.title}" class="h-28 w-40 object-cover">
          </a>
        </div>`;
    })
    .join("");
}

// Place a bid
export async function placeBid(listingId, bidAmount) {
  await fetchFromApi(`auction/listings/${listingId}/bids`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: bidAmount }),
  });
}

// Delete a listing
// Function to delete a listing
export async function deleteListing(listingId) {
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




// Handle user avatar
export async function handleAvatar() {
  const userIcon = document.getElementById("user-icon");
  if (!accessToken || !userName) {
    userIcon.innerHTML = `<a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>`;
    return;
  }

  try {
    const profile = await fetchFromApi(`auction/profiles/${userName}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const avatarUrl = profile.data?.avatar?.url || "/templates/auth/posts/user/default-avatar.jpg";
    userIcon.innerHTML = `
      <a href="/templates/auth/posts/user/profile.html">
        <img src="${avatarUrl}" alt="User Profile" class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" 
        onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';">
      </a>`;
    localStorage.setItem("avatar", avatarUrl);
  } catch (error) {
    userIcon.innerHTML = `<a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>`;
    console.error("Error fetching avatar:", error);
  }
}

// Create or update listings
export async function manageListing(listingId, data, isUpdate = false) {
  const endpoint = isUpdate
    ? `auction/listings/${listingId}`
    : "auction/listings";
  const method = isUpdate ? "PUT" : "POST";

  return await fetchFromApi(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}


// Function to handle login API call
export async function loginApi(email, password) {
  const loginData = { email, password };

  const response = await fetch(`${apiUrl}auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed.");
  }

  return await response.json();
}


// Update user profile
// api.js

export async function updateUserProfile(accessToken, userName, apiKey, requestBody) {
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

      if (!response.ok) throw new Error('Failed to update profile.');

      const updatedProfile = await response.json();
      return updatedProfile.data;
  } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
  }
}


// Create a new listing
export async function createListing(accessToken, listingData) {
  try {
    const response = await fetch('https://v2.api.noroff.dev/auction/listings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Noroff-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Error creating listing: ${JSON.stringify(errorDetails.errors, null, 2)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
}


export async function fetchUserListings(userName, accessToken) {
  return await fetchFromApi(`auction/listings?user=${userName}`, {
      headers: {
          Authorization: `Bearer ${accessToken}`,
      },
  });
}



export async function fetchAndStoreCredits(userName, accessToken) {
  const profile = await fetchUserProfile(userName, accessToken);
  const credits = profile.data?.credits || 0;
  localStorage.setItem("userCredits", credits);
}


// Fetch user profile
export async function fetchUserProfile(userName, accessToken) {
  try {
    const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'X-Noroff-API-Key': apiKey 
      }
    });

    if (!response.ok) throw new Error('Error fetching user profile');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// Fetch user wins
export async function fetchUserWins(profileName, accessToken, page = 1) {
  try {
    const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${profileName}/wins?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Noroff-API-Key': apiKey,
      },
    });

    if (!response.ok) throw new Error('Error fetching user wins');
    return await response.json();
  } catch (error) {
    console.error("Error fetching user wins:", error);
    throw error;
  }
}



// api.js

// api.js

export async function fetchUserProfileFromAPI(accessToken, userName, apiKey) {
  if (!accessToken || !userName) {
      throw new Error("You are not logged in. Please log in first.");
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
      return profileData.data;
  } catch (error) {
      throw new Error(`Error fetching profile data: ${error.message}`);
  }
}


// api.js

export async function fetchUserProfileData(accessToken, userName, apiKey) {
  if (!accessToken || !userName) {
      throw new Error("You are not logged in. Please log in first.");
  }

  try {
      const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Noroff-API-Key': apiKey,
          },
      });

      if (!response.ok) throw new Error('Error fetching profile data.');

      const profileData = await response.json();
      return profileData.data;
  } catch (error) {
      throw new Error(`Error fetching profile data: ${error.message}`);
  }
}


// api.js

export async function createListingApi(accessToken, apiKey, requestBody) {
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

      if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(`Error creating listing: ${JSON.stringify(errorDetails.errors, null, 2)}`);
      }

      const result = await response.json();
      return result;
  } catch (error) {
      throw new Error(`Network error occurred while creating the listing: ${error.message}`);
  }
}

// api.js

export async function updateListingApi(listingId, accessToken, apiKey, data) {
  try {
      const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Noroff-API-Key': apiKey,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
          throw new Error(responseData.message || 'Unknown error occurred');
      }

      return responseData;
  } catch (error) {
      throw new Error(`Error updating listing: ${error.message}`);
  }
}

// api.js

export async function fetchUserListingsApi(userName, accessToken, apiKey) {
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
          throw new Error(responseBody.message || 'Unknown error occurred');
      }

      return responseBody.data || responseBody;

  } catch (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
  }
}



// api.js



/*
import { apiUrl, apiKey } from "../constants/config.js";
import { displayCarousel, fetchUserListings, displayWins } from "../pages/listings.js";
import { accessToken, userName } from "../pages/listings.js";


// Fetch search results from the API
export async function fetchSearchResults(query) {
  const apiUrl = https://v2.api.noroff.dev/auction/listings/search?q=${encodeURIComponent(query)};

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(API request failed with status: ${response.status});
    }

    const data = await response.json();

    // Return results only if it's a valid array, otherwise return an empty array silently
    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    // Silently handle invalid data
    return [];

  } catch (error) {
    console.error("Error fetching search results:", error);
    return []; // Return empty array in case of any error (e.g., network issue)
  }
}


export async function getRandomPosts() {
  try {
      // Fetching the data from the API
      const response = await fetch(${apiUrl}auction/listings);
      const result = await response.json(); // Parsing the JSON response

      // Check if the 'data' property exists and is an array
      if (Array.isArray(result.data)) {
          // Pick 3 random posts from the 'data' array
          const randomPosts = getRandomItems(result.data, 4);

          // Display the random posts
          displayPosts(randomPosts);
      } else {
          console.error('Expected an array in the "data" property, but got:', result.data);
      }
  } catch (error) {
      console.error('Error fetching posts:', error);
  }
}

// Function to fetch auction listings and top 3 newest listings for carousel
export async function fetchAuctionListings() {
  try {
    const response = await fetch(${apiUrl}auction/listings);

    if (!response.ok) {
      throw new Error(HTTP error! Status: ${response.status});
    }

    const data = await response.json();

    // Get the top 3 newest listings for the carousel
    const top3NewestForCarousel = getTop3NewestListings(data.data);

    // Display the carousel
    displayCarousel(top3NewestForCarousel); // Pass top 3 to the carousel display function
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
  }
}

// Function to fetch auction listings
export async function fetchAuctionListing() {
  const listingsContainer = document.getElementById("listings-container");
  const loadMoreButton = document.getElementById("load-more-button-list");

  try {
    const response = await fetch(${apiUrl}auction/listings);
    if (!response.ok) {
      throw new Error(HTTP error! Status: ${response.status});
    }

    const data = await response.json();
    allListings = data.data; // Save the fetched listings globally
    currentPage = 1; // Reset page number to 1 when fetching new data

    loadMoreListings(); // Load the first set of listings by default

    loadMoreButton.style.display = "block"; // Show the "Show More" button
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
    listingsContainer.innerHTML = <p>Error fetching listings: ${error.message}</p>;
  }
}

function getTop3NewestListings(listings) {
  return listings
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 3); // Return the top 3 newest listings
}

export function displayPosts(posts) {
  const postsContainer = document.getElementById("random-posts-container");
  postsContainer.innerHTML = ""; // Clear any existing content

  posts.forEach((post) => {
    const imageUrl = post.media && post.media[0] ? post.media[0].url : null;
    if (imageUrl) {
      // Create a clickable image link
      const postElement = document.createElement("div");
      postElement.className = "flex justify-center items-center"; // Add styling to the parent div
      postElement.innerHTML = 
                <a href="/auction-details.html?listingId=${post.id}" 
                   class="block transform transition-transform hover:scale-110">
                    <img src="${imageUrl}" alt="${post.title}" class="h-28 w-40 object-cover">
                </a>
            ;
      // Append the created post to the container
      postsContainer.appendChild(postElement);
    }
  });
}

export async function placeBid(listingId, bidAmount, accessToken) {
  const bidResponse = await fetch(${apiUrl}auction/listings/${listingId}/bids, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Bearer ${accessToken},
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify({ amount: bidAmount }),
  });

  if (!bidResponse.ok) {
    const errorData = await bidResponse.json();
    const errorMessage = errorData.errors?.[0]?.message || "An unknown error occurred";
    throw new Error(Failed to place bid. Status: ${bidResponse.status}, Message: ${errorMessage});
  }
}

//placeholder
// Utility function to get random items from an array 
export function getRandomItems(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
  return shuffled.slice(0, count); // Get the first 'count' items
}




// Function to delete a listing
export async function deleteListing(listingId) {
  const apiUrl = https://v2.api.noroff.dev/auction/listings/${listingId};

  try {
      const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
              'Authorization': Bearer ${accessToken},
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


// Function to fetch auction wins by profile name
export async function fetchUserWinsByProfile(profileName, page = 1) {
  try {
    const token = localStorage.getItem('accessToken'); // Get the access token from localStorage
    if (!token) {
      alert("Please log in to view your wins.");
      return;
    }


    // Construct the URL with pagination support
    const url = ${apiUrl}auction/profiles/${profileName}/wins?page=${page};

    // Fetch the auction wins for the specified profile
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': Bearer ${token}, // Bearer token for authentication
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': apiKey || '', // Assuming apiKey is defined elsewhere if necessary
      },
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error(Failed to fetch user wins: ${errorResponse});
      
      if (response.status === 401) {
        alert("Unauthorized. Please log in again.");
        // Optionally, redirect to login page or clear stored token
      } else if (response.status === 404) {
        alert("Profile not found. Please check the username or log in with the correct account.");
      }
      return;
    }

    const winsData = await response.json();

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



// Handle credits
export async function fetchAndStoreCredits() {
  if (!accessToken || !userName) {
      alert("You are not logged in. Please log in first.");
      return;
  }

  try {
      const response = await fetch(https://v2.api.noroff.dev/auction/profiles/${userName}, {
          method: 'GET',
          headers: {
              'Authorization': Bearer ${accessToken},
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


// Profile avatar handling
export async function handleAvatar() {
  const userIcon = document.getElementById('user-icon');
  if (!accessToken || !userName) {
      userIcon.innerHTML = <a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>;
      return;
  }

  try {
      const response = await fetch(https://v2.api.noroff.dev/auction/profiles/${userName}, {
          method: 'GET',
          headers: { 'Authorization': Bearer ${accessToken}, 'X-Noroff-API-Key': apiKey },
      });

      const profileData = await response.json();
      const avatarUrl = profileData.data.avatar?.url || '/templates/auth/posts/user/default-avatar.jpg';

      // Update UI with avatar
      userIcon.innerHTML = <a href="/templates/auth/posts/user/profile.html"><img src="${avatarUrl}" alt="User Profile" class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue" onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';"></a>;
      
      // Store avatar in localStorage
      if (profileData.data.avatar?.url) {
          localStorage.setItem('avatar', profileData.data.avatar.url);
      }
  } catch (error) {
      console.error("Error fetching profile data:", error);
      userIcon.innerHTML = <a href="/templates/auth/login.html"><i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i></a>;
  }
}


export async function createListingApi(requestBody) {
  try {
      const response = await fetch('https://v2.api.noroff.dev/auction/listings', {
          method: 'POST',
          headers: {
              'Authorization': Bearer ${accessToken},
              'X-Noroff-API-Key': apiKey,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          const errorDetails = await response.json();
          console.error("Error response:", JSON.stringify(errorDetails, null, 2));
          throw new Error("Failed to create listing: " + JSON.stringify(errorDetails.errors, null, 2));
      }

      return await response.json(); // Return the successful response data
  } catch (error) {
      console.error("Error in createListingApi:", error);
      throw error; // Rethrow the error for the caller to handle
  }
}

export async function updateProfileApi(userName, requestBody) {
  try {
      const response = await fetch(https://v2.api.noroff.dev/auction/profiles/${userName}, {
          method: 'PUT',
          headers: {
              'Authorization': Bearer ${accessToken},
              'X-Noroff-API-Key': apiKey,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          const errorDetails = await response.json();
          console.error('Error response:', JSON.stringify(errorDetails, null, 2));
          throw new Error('Failed to update profile: ' + JSON.stringify(errorDetails.errors, null, 2));
      }

      return await response.json(); // Return the updated profile data
  } catch (error) {
      console.error('Error in updateProfileApi:', error);
      throw error; // Rethrow the error for the caller to handle
  }
}


// api/updateListing.js

export async function updateListingApi(listingId, title, description, mediaUrl) {
  const data = {
      title: title || '',
      description: description || '',
      media: mediaUrl ? [{ url: mediaUrl, alt: 'Updated Image' }] : [],
  };

  try {
      const response = await fetch(https://v2.api.noroff.dev/auction/listings/${listingId}, {
          method: 'PUT',
          headers: {
              'Authorization': Bearer ${accessToken},
              'X-Noroff-API-Key': apiKey,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (response.ok) {
          return responseData; // Return updated listing data
      } else {
          console.error('Error updating listing:', responseData.message);
          throw new Error(responseData.message || 'Error updating listing');
      }
  } catch (error) {
      console.error('Network or unexpected error:', error);
      throw error; // Rethrow error to be handled in UI logic
  }
}
*/