const apiUrl = "https://v2.api.noroff.dev/";

// Function to fetch auction listings
async function fetchAuctionListing() {
  try {
    const response = await fetch(`${apiUrl}auction/listings`);
    
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log("API Response:", data); // Log the data to verify it's fetched correctly

    // Get the top 10 newest listings (sorted by the created date)
    const top10Newest = getTop10NewestListing(data.data);
    
    // Call display function to render the listings on the webpage
    displayListings(top10Newest); // Pass the top 10 listings to the display function
    
  } catch (error) {
    console.error("Failed to fetch auction listings:", error);
  }
}

// Function to get the top 10 newest listings
function getTop10NewestListing(listings) {
  // Sort listings by 'created' date in descending order (newest first)
  return listings
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 10); // Return the top 10 newest listings
}

// Function to display auction listings in the HTML
function displayListings(listings) {
    const listingsContainer = document.getElementById('listings-container');
    
    // Clear previous listings
    listingsContainer.innerHTML = '';
    
    // If listings is not an array, log the structure
    if (!Array.isArray(listings)) {
      console.error('Expected an array of listings, but got:', listings);
      return;
    }
  
    // Loop over each listing and create HTML elements for each one
    listings.forEach(listing => {
      const listingElement = document.createElement('div');
      listingElement.classList.add('card', 'bg-white', 'p-6', 'rounded-lg', 'shadow-lg', 'mb-6', 'w-full', 'max-w-sm', 'flex', 'flex-col', 'h-full'); // Card styling
  
      // Title
      const titleElement = document.createElement('h3');
      titleElement.classList.add('post-card-title', 'text-xl', 'font-semibold', 'mb-4', 'overflow-hidden', 'text-ellipsis');
      titleElement.innerHTML = `
        <a href="/auction-details.html?listingId=${listing.id}" class="text-blue-600 hover:underline break-words">
          ${listing.title}
        </a>
      `;
  
// Description (Body)
const descriptionElement = document.createElement('p');
descriptionElement.classList.add(
  'post-card-body',    // Add any custom class if you have
  'text-sm',            // Text size
  'text-gray-700',      // Text color
  'mb-4',               // Margin bottom
  'overflow-hidden',    // Hide any overflow content
  'line-clamp-3'        // Limit text to 3 lines and show ellipsis
);
descriptionElement.textContent = listing.description || "No description available";

// Add the description to the card or the appropriate container

      // Image (if available)
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('flex', 'justify-center');
      if (listing.media && listing.media[0]) {
        const imageElement = document.createElement('img');
        imageElement.src = listing.media[0]?.url;
        imageElement.alt = listing.media[0]?.alt || "Item Image";
        imageElement.classList.add('w-full', 'h-48', 'object-cover', 'rounded-lg', 'mb-4');
        imageContainer.appendChild(imageElement);
      }
  
      // Tags
      const tagsElement = document.createElement('p');
      tagsElement.classList.add('post-card-meta', 'text-xs', 'text-gray-500', 'mb-4');
      tagsElement.textContent = listing.tags.length ? `Tags: ${listing.tags.join(', ')}` : "Tags: None";
  
      // Listing Information (Meta)
      const metaElement = document.createElement('div');
      metaElement.classList.add('post-card-meta', 'text-xs', 'text-gray-500');
      metaElement.innerHTML = `
        <p>Created: ${new Date(listing.created).toLocaleString()}</p>
        <p>Bids: ${listing._count?.bids || 0}</p>
        <p>Ends At: ${new Date(listing.endsAt).toLocaleString()}</p>
      `;
  
      // Append all elements to the listing element (the card)
      listingElement.appendChild(titleElement);
      listingElement.appendChild(descriptionElement);
      listingElement.appendChild(imageContainer);
      listingElement.appendChild(tagsElement);
      listingElement.appendChild(metaElement);
  
      // Append the listing element (the card) to the container
      listingsContainer.appendChild(listingElement);
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
      carouselItem.classList.add('carousel-item', 'flex', 'flex-row', 'flex-shrink-0', 'w-full', 'items-center', 'justify-between');
  
      // Text container (left side)
      const textContainer = document.createElement('div');
      textContainer.classList.add('w-1/2', 'p-6', 'flex', 'items-center', 'flex-col', 'text-left');
  
      // Title
      const titleElement = document.createElement('h3');
      titleElement.classList.add('text-xl', 'font-semibold', 'mb-2');
      titleElement.innerHTML = `
        <a href="/auction-details.html?listingId=${listing.id}" class="text-blue-600 hover:underline">
          ${listing.title}
        </a>
      `;
  
      // Description
      const descriptionElement = document.createElement('p');
      descriptionElement.classList.add('text-sm', 'text-gray-700', 'mb-4');
      descriptionElement.textContent = listing.description || "No description available";
  
      // Add title and description to text container
      textContainer.appendChild(titleElement);
      textContainer.appendChild(descriptionElement);
  
      // Image container (right side)
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('w-1/2', 'flex', 'justify-center', 'items-center', 'overflow-hidden');
  
      if (listing.media && listing.media[0]) {
        const imageElement = document.createElement('img');
        imageElement.src = listing.media[0]?.url;
        imageElement.alt = listing.media[0]?.alt || "Item Image";
        imageElement.classList.add('w-full', 'h-48', 'object-cover', 'px-3', 'rounded-lg');
        imageContainer.appendChild(imageElement);
      }
  
      // Append text container first, then image container
      carouselItem.appendChild(textContainer);
      carouselItem.appendChild(imageContainer);
  
      // Append carousel item to the carousel wrapper
      carouselWrapper.appendChild(carouselItem);
  
      // Create a dot for this item
      const dot = document.createElement('button');
      dot.classList.add('w-7', 'h-2', 'rounded-full', 'bg-Lavender', 'hover:bg-Amethyst');
  
      if (index === 0) {
        dot.classList.add('bg-Amethyst'); // Add this class only if it's the first item
      }
  
      dot.setAttribute('data-index', index); // Store the index for each dot
      dot.addEventListener('click', () => {
        currentIndex = index; // Update the current index
        updateCarouselPosition();
        updateDots();
      });
      carouselDots.appendChild(dot);
    });
  
    // Function to go to the next item
    function nextItem() {
      currentIndex = (currentIndex + 1) % listings.length;
      updateCarouselPosition();
      updateDots();
    }
  
    // Function to go to the previous item
    function prevItem() {
      currentIndex = (currentIndex - 1 + listings.length) % listings.length;
      updateCarouselPosition();
      updateDots();
    }
  
    // Update the carousel position based on the current index
    function updateCarouselPosition() {
      const offset = -currentIndex * 100; // Move the carousel to the correct item
      carouselWrapper.style.transform = `translateX(${offset}%)`;
    }
  
    // Update dot styling to reflect the current item
    function updateDots() {
        const dots = carouselDots.querySelectorAll('button');
        dots.forEach((dot, index) => {
          // Add bg-Amethyst to the current active dot and remove from others
          dot.classList.toggle('bg-Amethyst', index === currentIndex); 
        });
      }
  
    // Set initial position
    updateCarouselPosition();
  }
  
  // Call the function to fetch auction listings when the page loads
  fetchAuctionListings();
  