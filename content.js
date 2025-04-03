(function() {
    // Store the last URL so we can detect changes
    let lastUrl = window.location.href;
  
    // Function to update the tab title based on URL parameters if conditions are met
    function updateTitle() {
      try {
        const url = new URL(window.location.href);
  
        // Check that the host is dev.azure.com
        if (url.host !== "dev.azure.com") return;
  
        // Regular expression: match a URL that starts with a slash, then any non-slash characters,
        // another slash, any non-slash characters, then '/_library'
        const regex = /^\/[^\/]+\/[^\/]+\/_library/;
        if (!regex.test(url.pathname)) return;
  
        // Get the 'path' query parameter from the URL
        const pathParam = url.searchParams.get("path");
        if (pathParam) {
          // Set the document title to the decoded 'path' value
          document.title = decodeURIComponent(pathParam);
        }
      } catch (error) {
        console.error("Error in updateTitle:", error);
      }
    }
  
    // Initial title update on page load
    updateTitle();
  
    // Create a MutationObserver to detect DOM changes that may indicate navigation
    const observer = new MutationObserver((mutations) => {
      // Check if the URL has changed since the last update
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.debug("mutation");
        updateTitle();
      }
    });
  
    // Start observing changes in the document's body and its subtree
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Also listen for the hashchange event in case the SPA uses hash-based routing
    window.addEventListener('hashchange', () => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.debug("hashchange");
        updateTitle();
      }
    });
  })();
  