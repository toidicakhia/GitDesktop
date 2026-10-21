- The app now works in Edge/WebView2 109 (Chromium 109), the last runtime that
  installs on Windows 7 and 8.1: theme colors get sRGB fallbacks where OKLCH
  isn't supported, and the newer JavaScript built-ins the UI relies on are
  polyfilled instead of crashing.
