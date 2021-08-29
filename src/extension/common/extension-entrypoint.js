// This is the entrypoint code that should run in the extension's JavaScript environment. This code should NOT run in a
// content script and should not run in the web page.
//
// This code sets up the infrastructure for listening to messages from the web page. This code bootstraps the content
// script which then bootstraps the web page.

async function bootstrapTheContentScript() {

    // Get the current tab
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    // Create the content script entrypoint
    await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["extension/common/content-script-entrypoint.js"]
    })
}

// Register a listener for message passing to the web page.
chrome.runtime.onMessageExternal.addListener(async function (message, sender, sendResponse) {
    console.log(`Received a message:`)
    console.dir(message)

    if (message.command === "save") {
        let data = message.data
        chrome.storage.local.set(data, () => {
            sendResponse("The extension successfully saved the data")
        });
    } else if (message.command === "get") {
        let key = message.key
        chrome.storage.local.get(key, (found) => {
            sendResponse(found)
        });
    } else if (message.command === "open-generate-html-page") {
        chrome.tabs.create({
            url: 'web/generate-html.html'
        })
    } else {
        throw new Error(`Unrecognized command: '${message.command}'`)
    }
})

bootstrapTheContentScript()
    .then(() => console.log("[extension-entrypoint.js#bootstrapTheContentScript] Ran to completion"))
    .catch(e => console.log("[extension-entrypoint.js#bootstrapTheContentScript] Something went wrong", e))
