chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('/public_html/mario.htm', {
    'innerBounds': {
      'width': 1024,
      'height': 630
    }
  });
});