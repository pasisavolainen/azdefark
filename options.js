document.addEventListener('DOMContentLoaded', function() {
    const storage = chrome.storage.local;

    // Load the current settings from storage
    storage.get(["azdefarkSettings"], function(result) {
      const settings = result.azdefarkSettings || {};
      document.getElementById('environment').value = settings.environment || '';
      document.getElementById('remove').value = settings.remove || '';
      document.getElementById('replace').value = settings.replace || '';
    });

    // Save settings when the form is submitted
    document.getElementById('optionsForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const settings = {
        environment: document.getElementById('environment').value,
        remove: document.getElementById('remove').value,
        replace: document.getElementById('replace').value
      };
      storage.set({ azdefarkSettings: settings }, function() {
        alert('Settings saved!');
      });
    });
  });
