document.addEventListener('DOMContentLoaded', function() {
  // Load the current settings from storage
  chrome.storage.sync.get(["environment", "remove"], function(result) {
    document.getElementById('environment').value = result.environment || '';
    document.getElementById('remove').value = result.remove || '';
  });

  // Save settings when the form is submitted
  document.getElementById('optionsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const environment = document.getElementById('environment').value;
    const remove = document.getElementById('remove').value;
    chrome.storage.sync.set({ environment, remove }, function() {
      alert('Settings saved!');
    });
  });
});
