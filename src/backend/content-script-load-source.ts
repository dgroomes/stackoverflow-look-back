// This code should run in a content script and will load the web page with the web page components of the program.
//
// In general, I want to minimize the use of content scripts. As such, I will only use content scripts for their given
// capability to access the DOM (the extension background scripts are not allowed to do this!) and I will not use
// content scripts for any domain logic that could be implemented instead in the background scripts or on the web page.
// See the "My Bias Against Content Scripts" section in the README for more information.

import {chrome} from "../chromium-manifest-v2/chrome-extension-types.d.ts";

declare global {
    // Is this the idiomatic way to refer to global variables assigned to the "window" object?
    interface Window {
        contentScriptLoadSourceLoaded: boolean
    }
}

if (!window.contentScriptLoadSourceLoaded) {
    console.debug("[content-script-load-source.js] Loading...")
    window.contentScriptLoadSourceLoaded = true
    loadSourceOnWebPage()
} else {
    console.debug("[content-script-load-source.js] Already loaded.")
    chrome.runtime.sendMessage(null,
        "web-page-initialized",
        null)
}

function loadSourceOnWebPage() {
    let scriptEl = document.createElement("script")
    scriptEl.src = chrome.runtime.getURL("web-page/web-injected.js")
    scriptEl.id = "web-injected"
    document.head.append(scriptEl)

    // Register a window listener for the "web-page-initialized" message which the web page will send when it has finished
    // loading the extension JavaScript source code and running initialization code.
    window.addEventListener("message", function webPageInitializedListener({data}) {
        console.debug(`[content-script-load-source.js] Received a message on the 'window'. Here is the 'data':`)
        console.debug(JSON.stringify({data}, null, 2))
        if (data === "web-page-initialized") {
            console.debug("[content-script-load-source.js] Sending the 'web-page-initialized' message")
            chrome.runtime.sendMessage(null,
                "web-page-initialized",
                null)

            window.removeEventListener("message", webPageInitializedListener)
        }
    })
}
