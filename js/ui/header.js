function insertHeader() {
    const headerHTML = `
      <header id="header" class="py-1 mb-4 flex justify-between items-center">
        <a class="flex items-center" href="/templates/index.html">
          <img class="w-14 h-14 p-2" src="/assets/logo.svg" alt="logo-ballbid" />
          <h1 class="font-logo text-2xl text-RoyalBlue">Diamondbid</h1>
        </a>
        <div class="relative flex justify-center">
          <div class="relative">
            <!-- Search bar -->
            <input
              id="search-bar"
              class="w-80 px-2 py-1 m-1 bg-Gallery text-black focus:outline-none text-sm"
              type="text"
              placeholder="Search for profiles..."
            />
          
            <!-- Search icon button -->
            <i
              id="search-btn"
              class="fas fa-search px-1 text-base absolute top-1/2 right-3 transform -translate-y-1/2 text-RoyalBlue cursor-pointer"
            ></i>
          
            <!-- Dropdown container (Initially hidden) -->
            <div id="dropdown-container" class="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg hidden z-10 max-h-60 overflow-y-auto">
              <ul id="dropdown-list" class="list-none m-0 p-0"></ul>
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <div id="user-credits-header" class="text-RoyalBlue px-2 text-sm">Credits: 0</div>
          <div id="user-icon">
            <!-- JavaScript dynamically replaces this content -->
            <i class="text-xl px-4 text-RoyalBlue fa-regular fa-user"></i>
          </div>
          <a class="sign-in-btn button-box block" href="/templates/auth/login.html">Sign in</a>
  
          <!-- Log Out button (Initially hidden) -->
          <a class="log-out-btn button-box block hidden" href="#">Log Out</a>
        </div>
      </header>
    `;
  
    // Get the element where you want to insert the header (using its ID)
    const headerContainer = document.getElementById('header-container');
  
    if (headerContainer) {
      // Inject the header HTML into the container
      headerContainer.innerHTML = headerHTML;
    } else {
      console.log("No element with the id 'header-container' found!");
    }
  }
  
  // Call this function to insert the header when needed
  insertHeader();
  