(function() {
  // Function to update the tab title based on URL parameters if conditions are met
  function updateTitle() {
    try {
      const url = new URL(window.location.href);

      // Check that the host is dev.azure.com
      if (url.host !== "dev.azure.com") return;

      // Regular expression: start with a slash, then any non-slash characters,
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

  // Monkey-patch history.pushState and history.replaceState to detect SPA navigations
  const originalPushState = history.pushState;
  history.pushState = function(state) {
    const result = originalPushState.apply(history, arguments);
    console.debug("pushState called")
    updateTitle();
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function(state) {
    const result = originalReplaceState.apply(history, arguments);
    console.debug("replaceState called")
    updateTitle();
    return result;
  };

  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', updateTitle);

  // Optionally, if the application uses hash changes for navigation:
  window.addEventListener('hashchange', updateTitle);
})();
