const apiUrl = "https://v2.api.noroff.dev/";
import { apiKey } from "../../constants/config.js"; // Ensure correct path

// Function to get the top 10 newest listings
function getTop10NewestListing(listings) {
  if (!Array.isArray(listings)) {
    console.error("Listings is not an array:", listings);
    return [];
  }

  return listings
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 10);
}

// Function to fetch auction listings
async function fetchAuctionListing() {
  try {
    const response = await fetch(`${apiUrl}auction/listings`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    const top10Newest = getTop10NewestListing(data.data);
    displayListings(top10Newest);
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
  }
}

// Function to display auction listings in the HTML
function displayListings(listings) {
  const listingsContainer = document.getElementById('listings-container');
  listingsContainer.innerHTML = ''; // Clear previous listings

  if (!Array.isArray(listings)) {
    console.error("Expected an array of listings, but got:", listings);
    return;
  }

  listings.forEach(listing => {
    const listingElement = document.createElement('div');
    listingElement.classList.add(
      'card',
      'cursor-pointer',
      'bg-white',
      'shadow-lg',
      'mb-6',
      'w-full',
      'max-w-sm',
      'flex',
      'flex-col',
      'h-full'
    );

    // Handle the media property to avoid errors
    const imageUrl = listing.media?.[0]?.url || null;
    const imageAlt = listing.media?.[0]?.alt || "Item Image";

    // Creating the HTML structure for the card
    listingElement.innerHTML = `
      <div class="relative flex justify-center">
          <p class="absolute top-0 left-0 bg-RoyalBlue text-white text-xs font-bold px-4 py-2 shadow">
              Bids: ${listing._count?.bids || 0}
          </p>
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover" />`
              : '<div class="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">No Image Available</div>'
          }
      </div>
      <div class="p-3">
          <div>
              <h3 class="post-card-title text-xl font-semibold mb-4 overflow-hidden text-ellipsis">
                  <a href="/templates/auth/posts/details.html?listingId=${listing.id}" class="text-blue-600 hover:underline break-words">
                      ${listing.title}
                  </a>
              </h3>
              Tags: ${listing.tags?.length ? listing.tags.join(', ') : 'None'}
          </div>
          <div class="post-card-meta text-xs text-gray-500">
              <p>
                  <span>Created: ${new Date(listing.created).toLocaleString()}</span>
                  <span> | Ends At: ${new Date(listing.endsAt).toLocaleString()}</span>
              </p>
          </div>
      </div>
    `;

    // Add the card element to the listings container
    listingsContainer.appendChild(listingElement);

    // Add a click event listener to the card
    listingElement.addEventListener('click', function () {
      // Find the link inside the card
      const link = listingElement.querySelector('a');
      if (link) {
        // Navigate to the link's href
        window.location.href = link.href;
      }
    });
  });
}

// Call the function to fetch auction listings when the page loads
fetchAuctionListing();



// Function to fetch auction listings and top 3 newest listings for carousel
async function fetchAuctionListings() {
    try {
      const response = await fetch(`${apiUrl}auction/listings`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data);
  
      // Get the top 3 newest listings for the carousel
      const top3NewestForCarousel = getTop3NewestListings(data.data);
  
      // Display the carousel
      displayCarousel(top3NewestForCarousel); // Pass top 3 to the carousel display function
  
    } catch (error) {
      console.error("Failed to fetch auction listings:", error);
    }
  }
  
  // Function to get the top 3 newest listings for the carousel
  function getTop3NewestListings(listings) {
    return listings
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 3); // Return the top 3 newest listings
  }
  
  // Function to display carousel for top 3 newest listings
  function displayCarousel(listings) {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselDots = document.getElementById('carousel-dots');
    let currentIndex = 0;
  
    // Clear previous carousel items
    carouselWrapper.innerHTML = '';
    carouselDots.innerHTML = '';
  
    // Create carousel item container for each listing
    listings.forEach((listing, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item', 'flex', 'flex-row', 'flex-shrink-0', 'w-full', 'justify-between',);
  
      // Text container (left side)
      const textContainer = document.createElement('div');
      textContainer.classList.add('w-1/2', 'p-6', 'flex', 'flex-col', 'text-left');
  
      // Title
      const titleElement = document.createElement('h3');
      titleElement.classList.add('text-4xl', 'font-semibold', 'mb-2', 'font-Graduate');
      titleElement.innerHTML = `
        <a href="/auction-details.html?listingId=${listing.id}" class="text-blue-600 hover:underline">
          ${listing.title}
        </a>
      `;
  
      // Description
      const descriptionElement = document.createElement('p');
      descriptionElement.classList.add('text-sm', 'px-4', 'text-gray-700', 'mb-4');
      descriptionElement.textContent = listing.description || "No description available";
  
      // Add title and description to text container
      textContainer.appendChild(titleElement);
      textContainer.appendChild(descriptionElement);
  
      // Image container (right side)
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('w-1/2', 'flex', 'justify-center', 'm-4', 'items-center', 'overflow-hidden');
  
      if (listing.media && listing.media[0]) {
        const imageElement = document.createElement('img');
        imageElement.src = listing.media[0]?.url;
        imageElement.alt = listing.media[0]?.alt || "Item Image";
        imageElement.classList.add('w-full', 'h-64', 'object-cover', 'px-3', 'rounded-lg');
        imageContainer.appendChild(imageElement);
      }
  
      // Append text container first, then image container
      carouselItem.appendChild(textContainer);
      carouselItem.appendChild(imageContainer);
  
      // Append carousel item to the carousel wrapper
      carouselWrapper.appendChild(carouselItem);
  
      // Create a dot for this item
      const dot = document.createElement('button');
      dot.classList.add('w-12', 'h-1.5', 'bg-RoyalBlue', 'hover:bg-PersianBlue');
  
      dot.setAttribute('data-index', index); // Store the index for each dot
      dot.addEventListener('click', () => {
        currentIndex = index; // Update the current index
        updateCarouselPosition();
      });
      carouselDots.appendChild(dot);
    });
  
    // Function to go to the next item
    function nextItem() {
      currentIndex = (currentIndex + 1) % listings.length;
    }
  
    // Function to go to the previous item
    function prevItem() {
      currentIndex = (currentIndex - 1 + listings.length) % listings.length;
      updateCarouselPosition();
    }
  
    // Update the carousel position based on the current index
    function updateCarouselPosition() {
      const offset = -currentIndex * 100; // Move the carousel to the correct item
      carouselWrapper.style.transform = `translateX(${offset}%)`;
    }

    // Set initial position
    updateCarouselPosition();
  }
  
  // Call the function to fetch auction listings when the page loads
  fetchAuctionListings();
  



  async function getRandomPosts() {
      try {
          // Fetching the data from the API
          const response = await fetch(`${apiUrl}auction/listings`);
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
  
  // Utility function to get random items from an array
  function getRandomItems(arr, count) {
      const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
      return shuffled.slice(0, count); // Get the first 'count' items
  }
  
  // Display posts on the page
  function displayPosts(posts) {
      const postsContainer = document.getElementById('random-posts-container');
      postsContainer.innerHTML = ''; // Clear any existing content
      
      
  
      posts.forEach(post => {
        const imageUrl = post.media && post.media[0] ? post.media[0].url : null;
        if (imageUrl) {
            // Create a clickable image link
            const postElement = document.createElement('div');
            postElement.className = "flex justify-center items-center"; // Add styling to the parent div
            postElement.innerHTML = `
                <a href="/auction-details.html?listingId=${post.id}" 
                   class="block transform transition-transform hover:scale-110">
                    <img src="${imageUrl}" alt="${post.title}" class="h-28 w-40 object-cover">
                </a>
            `;
            // Append the created post to the container
            postsContainer.appendChild(postElement);
        }
    });
}    
  
  // Call the function to fetch and display random posts
  getRandomPosts();
  

//--------------------------------------------------------------------------------------------------------
  
  
  // Add event listener to the search bar to trigger the search on "Enter" key press
  document.getElementById('search-bar').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      const query = event.target.value;  // Get the search query
      displaySearchResults(query);  // Perform the search and update the dropdown
    }
  });
  
  // Add event listener to the search icon to trigger the search on click
  document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-bar').value;  // Get the search query
    displaySearchResults(query);  // Perform the search and update the dropdown
  });
  
  // Optional: Hide dropdown if clicked outside
  document.addEventListener('click', function(event) {
    const dropdownContainer = document.getElementById('dropdown-container');
    const searchBar = document.getElementById('search-bar');
  
    // If the click is outside the search bar and dropdown, hide the dropdown
    if (!searchBar.contains(event.target) && !dropdownContainer.contains(event.target)) {
      dropdownContainer.classList.add('hidden');
    }
  });
  



  //---------------------------------------------------------------

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



//-------------------------------------------------------------------------

// Wait for the DOM to load before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Get the credits from localStorage
  const credits = localStorage.getItem('userCredits') || 0; // Default to 0 if not found

  // Get the element where credits should be displayed (the header element)
  const creditsElement = document.getElementById('user-credits-header');

  // Display the credits in the header
  if (creditsElement) {
      creditsElement.textContent = `Credits: ${credits}`;
  }
});




//-----------------------------------------------------------------------------------





document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-bar');
  const searchBtn = document.getElementById('search-btn');
  const dropdownContainer = document.getElementById('dropdown-container');
  const dropdownList = document.getElementById('dropdown-list');

  if (!searchInput || !searchBtn) {
    console.error("Search input or button element not found");
    return;
  }

  // Event listener for search icon click
  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim(); // Get the trimmed query from input

    // Check if the query is empty
    if (query === '') {
      dropdownContainer.classList.add('hidden'); // Hide dropdown if query is empty
      return;
    }

    try {
      const results = await fetchSearchResults(query); // Fetch results from API
      displaySearchResults(results); // Display the results in the dropdown
    } catch (error) {
      console.error("Error in search:", error);
    }
  });
});

// Fetch search results from the API
async function fetchSearchResults(query) {
  const apiUrl = `https://v2.api.noroff.dev/auction/listings/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
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

// Display search results (profiles and listings)
function displaySearchResults(results) {
  const dropdownList = document.getElementById('dropdown-list');
  const dropdownContainer = document.getElementById('dropdown-container');

  dropdownList.innerHTML = ''; // Clear previous results

  // Ensure results is an array
  if (!Array.isArray(results)) {
    dropdownContainer.classList.add('hidden');
    return;
  }

  // Hide dropdown if no results
  if (results.length === 0) {
    dropdownContainer.classList.add('hidden');
    return;
  }

  // Populate dropdown with results
  results.forEach(result => {
    const listItem = document.createElement('li');
    listItem.classList.add('p-2', 'hover:bg-gray-100', 'cursor-pointer');
    listItem.innerHTML = `<a href="/templates/auth/posts/details.html?listingId=${result.id}" class="block px-4 py-2 text-gray-900">${result.title || result.name}</a>`;
    dropdownList.appendChild(listItem);
  });

  // Show the dropdown with results
  dropdownContainer.classList.remove('hidden');
}
