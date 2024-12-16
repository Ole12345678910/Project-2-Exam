import { fetchSearchResults } from "./api.js";

// Function to display search results (profiles and listings)
export function displaySearchResults(results) {
  const dropdownList = document.getElementById("dropdown-list");
  const dropdownContainer = document.getElementById("dropdown-container");

  // Check if the required elements exist in the DOM
  if (!dropdownList || !dropdownContainer) {
    return; // Exit if either is missing
  }

  dropdownList.innerHTML = ""; // Clear any previous results

  // Ensure results is an array before proceeding
  if (!Array.isArray(results)) {
    dropdownContainer.classList.add("hidden"); // Hide dropdown if results are not an array
    return;
  }

  // Hide dropdown if there are no results
  if (results.length === 0) {
    dropdownContainer.classList.add("hidden");
    return;
  }

  // Loop through each result and create a list item for it
  results.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.classList.add("p-2", "hover:bg-gray-100", "cursor-pointer");
    listItem.innerHTML = `<a href="/templates/auth/posts/details.html?listingId=${
      result.id
    }" class="block px-4 py-2 text-gray-900">${
      result.title || result.name
    }</a>`;
    dropdownList.appendChild(listItem); // Add the list item to the dropdown
  });

  // Show the dropdown container if results are available
  dropdownContainer.classList.remove("hidden");
}

// Initialize search functionality only if the relevant DOM elements exist
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const dropdownContainer = document.getElementById("dropdown-container");

  // Check if the required elements are available before proceeding
  if (!searchInput || !searchBtn || !dropdownContainer) {
    return; // Exit if any required element is missing
  }

  // Event listener for when the search button is clicked
  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim(); // Get the query value and remove any extra spaces

    // If the search query is empty, hide the dropdown
    if (query === "") {
      dropdownContainer.classList.add("hidden");
      return;
    }

    try {
      // Fetch the search results from the API
      const results = await fetchSearchResults(query);
      displaySearchResults(results); // Display the fetched results
    } catch (error) {
      console.error("Error in search:", error); // Log any errors
    }
  });

  // Optional feature: Hide the dropdown if the user clicks outside of the search area
  document.addEventListener("click", (event) => {
    if (!searchInput || !dropdownContainer) return;

    // Hide the dropdown if the click is outside the search input and dropdown container
    if (
      !searchInput.contains(event.target) &&
      !dropdownContainer.contains(event.target)
    ) {
      dropdownContainer.classList.add("hidden");
    }
  });
});

// Exportable function to initialize search dynamically with custom element IDs
export function initializeSearch(
  searchInputId,
  searchButtonId,
  dropdownContainerId,
  dropdownListId
) {
  const searchInput = document.getElementById(searchInputId);
  const searchBtn = document.getElementById(searchButtonId);
  const dropdownContainer = document.getElementById(dropdownContainerId);
  const dropdownList = document.getElementById(dropdownListId);

  // Check if all required elements are available
  if (!searchInput || !searchBtn || !dropdownContainer || !dropdownList) {
    return; // Exit if any required element is missing
  }

  // Event listener for when the search button is clicked
  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim(); // Get the trimmed query value

    // If the query is empty, hide the dropdown
    if (query === "") {
      dropdownContainer.classList.add("hidden");
      return;
    }

    try {
      // Fetch the search results based on the query
      const results = await fetchSearchResults(query);
      displaySearchResults(results, dropdownList); // Display the results in the dropdown
      dropdownContainer.classList.remove("hidden"); // Show dropdown if results exist
    } catch (error) {
      console.error("Error in search:", error); // Log any errors
    }
  });
}
