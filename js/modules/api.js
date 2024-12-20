import { apiUrl, apiKey } from "../constants/config.js";
import { displayCarousel, accessToken, userName, fetchUserListings } from "../pages/listings.js";

// Fetch data from the API.
// A generic function for API calls to reduce repetitive code.

export async function fetchFromApi(
  endpoint,
  { method = "GET", headers = {}, body, accessToken } = {}
) {
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Include Authorization header if accessToken is available
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const requestOptions = {
    method,
    headers: requestHeaders,
    ...(body && { body: JSON.stringify(body) }), // Stringify body if present
  };

  try {
    // Fetch the data from the API
    const response = await fetch(`${apiUrl}${endpoint}`, requestOptions);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API response error:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || `Error: ${response.status}`
      );
    }
    return await response.json(); // Return the parsed response data
  } catch (error) {
    console.error(`Error in fetchFromApi(${endpoint}):`, error.message);
    throw error; // Rethrow to let the caller handle the error
  }
}

// Fetch search results from the API
export async function fetchSearchResults(query) {
  const result = await fetchFromApi(
    `auction/listings/search?q=${encodeURIComponent(query)}`
  );
  return Array.isArray(result.data) ? result.data : []; // Ensure the result is an array
}

// Fetch auction listings
export async function fetchAuctionListings() {
  const result = await fetchFromApi("auction/listings");
  displayCarousel(getTop3NewestListings(result.data)); // Display the top 3 newest listings
}

// Helper function to get the top 3 newest listings
function getTop3NewestListings(listings) {
  // Sort listings by the date (assuming `createdAt` is the property containing the creation date)
  return listings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort descending
    .slice(0, 3); // Get the top 3 newest listings
}

// Place a bid on a listing
export async function placeBid(listingId, bidAmount, accessToken) {
  try {
    const response = await fetch(
      `${apiUrl}auction/listings/${listingId}/bids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
        body: JSON.stringify({ amount: bidAmount }), // Send the bid amount
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors[0]?.message || "Error placing bid");
    }

    const result = await response.json();
    alert("Your bid has been placed successfully!");

    // Reload the page to refresh the listing details
    location.reload(); // This will reload the current page

    return result;
  } catch (error) {
    alert(error.message || "An error occurred while placing the bid.");
  }
}

// Function to delete a listing
export async function deleteListing(listingId) {
  const apiUrl = `https://v2.api.noroff.dev/auction/listings/${listingId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
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

// Handle user avatar (display the user's profile icon)
export async function handleAvatar() {
  const userIcon = document.getElementById("user-icon");
  if (!accessToken || !userName) {
    userIcon.innerHTML = `
      <a href="/templates/auth/login.html">
        <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
      </a>`;
    return;
  }

  try {
    // Fetch the user's profile data
    const profileData = await fetchUserProfileData(
      accessToken,
      userName,
      apiKey
    );
    const avatarUrl =
      profileData.avatar?.url ||
      "/templates/auth/posts/user/default-avatar.jpg";

    userIcon.innerHTML = `
      <a href="/templates/auth/posts/user/profile.html">
        <img src="${avatarUrl}" alt="User Profile" 
          class="w-8 h-8 rounded-full border-2 hover:border-2 hover:border-RoyalBlue"
          onerror="this.src='/templates/auth/posts/user/default-avatar.jpg';">
      </a>`;

    // Store the avatar URL in localStorage if available
    if (profileData.avatar?.url) {
      localStorage.setItem("avatar", profileData.avatar.url);
    }
  } catch (error) {
    console.error("Error:", error.message);
    userIcon.innerHTML = `
      <a href="/templates/auth/login.html">
        <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
      </a>`;
  }
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

    // Specifically handle 401 Unauthorized errors
    if (response.status === 401) {
      throw new Error("Invalid email or password.");
    }

    // Handle other types of errors
    throw new Error(errorData.message || "Login failed.");
  }

  return await response.json();
}

// Update user profile
export async function updateUserProfile(
  accessToken,
  userName,
  apiKey,
  requestBody
) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) throw new Error("Failed to update profile.");

    const updatedProfile = await response.json();
    return updatedProfile.data; // Return updated profile data
  } catch (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
}

// Create a new listing
export async function createListing(accessToken, listingData) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listingData), // Send listing data
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(
        `Error creating listing: ${JSON.stringify(
          errorDetails.errors,
          null,
          2
        )}`
      );
    }

    return await response.json(); // Return the newly created listing
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
}

// Fetch and store credits
export async function fetchAndStoreCredits(userName, accessToken) {
  const profile = await fetchUserProfile(userName, accessToken);
  const credits = profile.data?.credits || 0;
  localStorage.setItem("userCredits", credits); // Store credits in localStorage
}

// Fetch user wins
export async function fetchUserWins(profileName, accessToken, page = 1) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${profileName}/wins?page=${page}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching user wins");
    }

    const winsData = await response.json();
    return winsData.data || []; // Return wins data or an empty array if no wins
  } catch (error) {
    console.error("Error fetching user wins:", error);
    return []; // Return an empty array on error
  }
}

// Fetch user profile from API
export async function fetchUserProfileFromAPI(accessToken, userName, apiKey) {
  if (!accessToken || !userName) {
    throw new Error("You are not logged in. Please log in first.");
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) throw new Error("Error fetching user profile.");

    const profileData = await response.json();
    return profileData.data; // Return the profile data
  } catch (error) {
    throw new Error(`Error fetching profile data: ${error.message}`);
  }
}

// Fetch user profile data
export async function fetchUserProfileData(accessToken, userName, apiKey) {
  if (!accessToken || !userName) {
    throw new Error("You are not logged in. Please log in first.");
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) throw new Error("Error fetching profile data.");

    const profileData = await response.json();
    return profileData.data; // Return the profile data
  } catch (error) {
    throw new Error(`Error fetching profile data: ${error.message}`);
  }
}

// Create a listing via API
export async function createListingApi(accessToken, apiKey, requestBody) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Send listing data
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(
        `Error creating listing: ${JSON.stringify(
          errorDetails.errors,
          null,
          2
        )}`
      );
    }

    const result = await response.json();
    return result; // Return the created listing data
  } catch (error) {
    throw new Error(
      `Network error occurred while creating the listing: ${error.message}`
    );
  }
}

// Update a listing via API
export async function updateListingApi(listingId, accessToken, apiKey, data) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/listings/${listingId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Send updated listing data
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Unknown error occurred");
    }

    return responseData; // Return the updated listing data
  } catch (error) {
    throw new Error(`Error updating listing: ${error.message}`);
  }
}

// Fetch user credits via API
export async function fetchUserCreditsApi(userName, accessToken, apiKey) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || "Error fetching user profile.");
    }

    const profileData = await response.json();
    return profileData.data.credits; // Return only the credits
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Rethrow for the caller to handle
  }
}

// Fetch user profile from API
export async function fetchUserProfile(userName, accessToken) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) throw new Error("Error fetching user profile");
    return await response.json(); // Assuming this response contains the user's 'id' field
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get user profile data
export async function getUserProfileData(userName, accessToken) {
  try {
    const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
        },
    });

    if (!response.ok) throw new Error("Failed to fetch user profile data.");

    const profileData = await response.json();
    return profileData.data; // Assuming the actual profile data is under `.data`
  } catch (error) {
    console.error("Error in getUserProfileData:", error);
    throw error;
  }
}
