// This code should run in a content script and will load the web page with a JavaScript file that will do even additional
// source code loading.
//
// In general, I want to minimize the use of content scripts. As such, I will only use content scripts for their given
// capability to access the DOM (the extension background scripts are not allowed to do this!) and I will not use
// content scripts for any domain logic that could be implemented instead in the background scripts or on the web page.
// See the "My Bias Against Content Scripts" section in the README for more information.

{
    console.log("[content-script-load-source.js] Running...")

    let scriptEl = document.createElement("script")
    scriptEl.src = chrome.runtime.getURL("web/web-load-source.js")
    scriptEl.id = "web-load-source"
    document.head.append(scriptEl)
}
