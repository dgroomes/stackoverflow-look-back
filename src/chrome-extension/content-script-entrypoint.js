// This is the entrypoint code that should run in a "content script".
//
// In general, I want to minimize the use of content scripts. As such, I will only use content scripts for their given
// capability to access the DOM but I will not use content scripts for any domain logic that could be implemented instead
// in the extension or on the web page.
//
// The amount of code here should be kept a minimum. See the "My Bias Against Content Scripts" section in the README for
// background. This code will do a small amount of DOM manipulation to bootstrap the web page. And that's it. The main
// execution of the flow should occur only between the extension and the web page. The content script should disappear
// right after the bootstrap phase..


// Inject a "<script>" element into the web page which will download "dom-entrypoint.js"
let scriptEl = document.createElement("script")
scriptEl.src = chrome.runtime.getURL("web/dom-entrypoint.js")
scriptEl.id = "dom-entrypoint"
document.head.append(scriptEl)



