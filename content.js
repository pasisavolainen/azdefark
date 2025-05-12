(function() {
    // Global variable for custom settings (populated from storage)
    let customSettings = {
      environment: "",
      remove: "",
      replace: []
    };
  
    // Use chrome.storage.sync if available, otherwise fallback to chrome.storage.local
    const storage = chrome.storage.local;
  
    // Load settings from persistent storage and then execute callback
    function loadSettings(callback) {
      storage.get(["azdefarkSettings"], function(result) {
        const settings = result.azdefarkSettings || {};
        customSettings.environment = settings.environment || "";
        customSettings.remove = settings.remove || "";
        customSettings.replace = (settings.replace || "")
                                      .split(/\n/)
                                      .map(s => s.split(/\s*@@@\s*/))
                                        .filter(s => s.length === 2)
                                      .map(s => ({ from: s[0], to: s[1] }));
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
      if (customSettings.replace.length > 0) {
        console.debug("Applying replace regexes:", customSettings.replace);
        customSettings.replace.forEach(({ from, to }) => {
          try {
            const replaceRegex = new RegExp(from, 'g');
            newTitle = newTitle.replace(replaceRegex, to);
          } catch (e) {
            console.error("Invalid replace regex:", e, from, { currentTitle: newTitle });
          }
        });
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
        const isLibraryRegex = /^\/[^\/]+\/[^\/]+\/_library/;
        const isBuildRegex = /^\/[^\/]+\/[^\/]+\/_build/;
        if (isLibraryRegex.test(url.pathname)) {
  
          // Get the 'path' query parameter from the URL
          const pathParam = url.searchParams.get("path");
          if (pathParam) {
            const rawTitle = decodeURIComponent(pathParam);
            const newTitle = applyCustomRegexes(rawTitle);
            // the breadcrumb title will get '*' appended when variables are edited, abuse that to detect
            // that some variable is considered "edited"
            // document.querySelector('[aria-label="Laskutus.Tulosnakyma.kehi"]')
            document.title = newTitle;
          }
        } else if (isBuildRegex.test(url.pathname)) {

          const derp = JSON.parse(document.getElementById("dataProviders")?.innerText);
          const definitionId = url.searchParams.get("definitionId");
          var pipeline = derp?.data["ms.vss-build-web.pipelines-data-provider"]?.pipelines?.find(a => a.id === definitionId);
          const definitionScope = url.searchParams.get("definitionScope");

          let buildname = derp?.data["ms.vss-build-web.pipeline-details-data-provider"]?.definitionName
                          ?? pipeline?.name
                          ?? definitionScope;

          if (buildname) {
            document.title = "🚚 " + buildname;
          }
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
