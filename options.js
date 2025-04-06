document.addEventListener('DOMContentLoaded', function() {
    // Use chrome.storage.sync if available, otherwise fallback to chrome.storage.local
    const storage = chrome.storage.local;
    
    // Load the current settings from storage
    storage.get(["environment", "remove"], function(result) {
      document.getElementById('environment').value = result?.environment || '';
      document.getElementById('remove').value = result?.remove || '';
    });
  
    // Save settings when the form is submitted
    document.getElementById('optionsForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const environment = document.getElementById('environment').value;
      const remove = document.getElementById('remove').value;
      storage.set({ environment, remove }, function() {
        alert('Settings saved!');
      });
    });
  });
  