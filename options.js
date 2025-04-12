document.addEventListener('DOMContentLoaded', function() {
    // Use chrome.storage.sync if available, otherwise fallback to chrome.storage.local
    const storage = chrome.storage.local;

    // Load the current settings from storage
    storage.get(["environment", "remove", "replace"], function(result) {
      document.getElementById('environment').value = result?.environment || '';
      document.getElementById('remove').value = result?.remove || '';
      document.getElementById('replace').value = result?.replace || '';
    });

    // Save settings when the form is submitted
    document.getElementById('optionsForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const environment = document.getElementById('environment').value;
      const remove = document.getElementById('remove').value;
      const replace = document.getElementById('replace').value;
      storage.set({ environment, remove, replace }, function() {
        alert('Settings saved!');
      });
    });
  });
