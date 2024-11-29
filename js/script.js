const apiUrl = "https://v2.api.noroff.dev/";

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
    listingsContainer.innerHTML = '';
  
    if (!Array.isArray(listings)) {
      console.error('Expected an array of listings, but got:', listings);
      return;
    }
  
    listings.forEach(listing => {
      const listingElement = document.createElement('div');
      listingElement.classList.add('card', 'cursor-pointer', 'bg-white', 'shadow-lg', 'mb-6', 'w-full', 'max-w-sm', 'flex', 'flex-col', 'h-full');
      
      // Creating the HTML structure for the card
      listingElement.innerHTML = `
      <div class="relative flex justify-center">
          <p class="absolute top-0 left-0 bg-RoyalBlue text-white text-xs font-bold px-4 py-2 shadow">
          Bids: ${listing._count?.bids || 0}
          </p>${listing.media && listing.media[0]
              ? `<img src="${listing.media[0].url}" alt="${listing.media[0].alt || 'Item Image'}" class="w-full h-48 object-cover" />`
              : '<div class="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">No Image Available</div>'}
      </div>
      <div class="p-3">
          <div>
              <h3 class="post-card-title text-xl font-semibold mb-4 overflow-hidden text-ellipsis">
              <a href="/auction-details.html?listingId=${listing.id}" class="text-blue-600 hover:underline break-words">
                  ${listing.title}
              </a>
              </h3>
              <p class="post-card-meta text-xs text-gray-500 mb-4">
              Tags: ${listing.tags.length ? listing.tags.join(', ') : 'None'}
              </p>
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
      listingElement.addEventListener('click', function() {
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
  