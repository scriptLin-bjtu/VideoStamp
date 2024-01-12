const injectedScript = document.createElement('script');
injectedScript.src = chrome.runtime.getURL('content/injected.js');
(document.head || document.documentElement).appendChild(injectedScript);