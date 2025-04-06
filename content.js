(function() {
    // Global variable for custom settings (populated from storage)
    let customSettings = {
      environment: "",
      remove: ""
    };
  
    // Use chrome.storage.sync if available, otherwise fallback to chrome.storage.local
    const storage = chrome.storage.local;
  
    // Load settings from persistent storage and then execute callback
    function loadSettings(callback) {
      storage.get(["environment", "remove"], function(result) {
        customSettings.environment = result?.environment || "";
        customSettings.remove = result?.remove || "";
        if (typeof callback === "function") {
          callback();
        }
      });
    }
  
    // Function to apply custom regex transformations on the raw title.
    function applyCustomRegexes(rawTitle) {
      let newTitle = rawTitle;
      console.debug("Applying custom regexes to:", rawTitle, customSettings);
      if (customSettings.environment) {
        try {
          const envRegex = new RegExp(customSettings.environment, 'i');
          const envMatch = rawTitle.match(envRegex);
          console.debug("Environment match:", envMatch, customSettings);
          if (envMatch) {
            const envText = envMatch[0];
            let cleanedTitle = rawTitle;
            if (customSettings.remove) {
              try {
                const removeRegex = new RegExp(customSettings.remove, 'g');
                cleanedTitle = rawTitle.replace(removeRegex, '');
              } catch (e) {
                console.error("Invalid remove regex:", e);
              }
            }
            newTitle = `[${envText}] ${cleanedTitle.trim()}`;
          }
        } catch (e) {
          console.error("Invalid environment regex:", e);
        }
      } else if (customSettings.remove) {
        console.debug("Applying remove regex:", customSettings.remove);
        try {
          const removeRegex = new RegExp(customSettings.remove, 'g');
          newTitle = rawTitle.replace(removeRegex, '').trim();
        } catch (e) {
          console.error("Invalid remove regex:", e);
        }
      }
      return newTitle;
    }
  
    // Function to update the tab title based on URL parameters if conditions are met
    function updateTitle() {
      try {
        const url = new URL(window.location.href);
  
        // Check that the host is dev.azure.com
        if (url.host !== "dev.azure.com") return;
  
        // Regular expression: match a URL that starts with two segments followed by '/_library'
        const regex = /^\/[^\/]+\/[^\/]+\/_library/;
        if (!regex.test(url.pathname)) return;
  
        // Get the 'path' query parameter from the URL
        const pathParam = url.searchParams.get("path");
        if (pathParam) {
          const rawTitle = decodeURIComponent(pathParam);
          const newTitle = applyCustomRegexes(rawTitle);
          document.title = newTitle;
        }
      } catch (error) {
        console.error("Error in updateTitle:", error);
      }
    }
  
    // Mutation Observer to detect navigation changes in a SPA
    let lastUrl = window.location.href;
    loadSettings(updateTitle);
  
    // Create a MutationObserver to detect DOM changes that may indicate navigation
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        loadSettings(updateTitle);
      }
    });
  
    // Start observing changes in the document's body and its subtree
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Listen for hash changes (in case the SPA uses hash-based routing)
    window.addEventListener('hashchange', () => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        loadSettings(updateTitle);
      }
    });
  })();
  