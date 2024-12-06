import { fetchSearchResults } from "./api.js";

// Display search results (profiles and listings)
export function displaySearchResults(results) {
  const dropdownList = document.getElementById("dropdown-list");
  const dropdownContainer = document.getElementById("dropdown-container");

  if (!dropdownList || !dropdownContainer) {
    return;
  }

  dropdownList.innerHTML = ""; // Clear previous results

  // Ensure results is an array
  if (!Array.isArray(results)) {
    dropdownContainer.classList.add("hidden");
    return;
  }

  // Hide dropdown if no results
  if (results.length === 0) {
    dropdownContainer.classList.add("hidden");
    return;
  }

  // Populate dropdown with results
  results.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.classList.add("p-2", "hover:bg-gray-100", "cursor-pointer");
    listItem.innerHTML = `<a href="/templates/auth/posts/details.html?listingId=${
      result.id
    }" class="block px-4 py-2 text-gray-900">${
      result.title || result.name
    }</a>`;
    dropdownList.appendChild(listItem);
  });

  // Show the dropdown with results
  dropdownContainer.classList.remove("hidden");
}

// Initialize search functionality only if the elements exist
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const dropdownContainer = document.getElementById("dropdown-container");

  if (!searchInput || !searchBtn || !dropdownContainer) {
    return;
  }

  // Event listener for search icon click
  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim(); // Get the trimmed query from input

    // Check if the query is empty
    if (query === "") {
      dropdownContainer.classList.add("hidden"); // Hide dropdown if query is empty
      return;
    }

    try {
      const results = await fetchSearchResults(query); // Fetch results from API
      displaySearchResults(results); // Display the results in the dropdown
    } catch (error) {
      console.error("Error in search:", error);
    }
  });

  // Optional: Hide dropdown if clicked outside
  document.addEventListener("click", (event) => {
    if (!searchInput || !dropdownContainer) return;

    // If the click is outside the search bar and dropdown, hide the dropdown
    if (
      !searchInput.contains(event.target) &&
      !dropdownContainer.contains(event.target)
    ) {
      dropdownContainer.classList.add("hidden");
    }
  });
});

// Exportable function to initialize search dynamically
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

  if (!searchInput || !searchBtn || !dropdownContainer || !dropdownList) {
    return;
  }

  // Event listener for search icon click
  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim(); // Get the trimmed query from input

    if (query === "") {
      dropdownContainer.classList.add("hidden"); // Hide dropdown if query is empty
      return;
    }

    try {
      const results = await fetchSearchResults(query); // Fetch results from API
      displaySearchResults(results, dropdownList); // Display the results in the dropdown
      dropdownContainer.classList.remove("hidden"); // Show dropdown if results are available
    } catch (error) {
      console.error("Error in search:", error);
    }
  });
}
