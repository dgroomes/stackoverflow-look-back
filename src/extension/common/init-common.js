// This is the common code that is imported by the unique "init.js" files which are defined for each plugin.
// Register a listener for message passing to the web page.

// Set a default value for the 'votesPageLimit' configuration
function setDefaultConfig() {
    const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.log(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`)
    })
}

// Registers a listener in the background script that will receive remote procedure call (RPC) requests from the front-end
// and then executes those requests.
function addRpcListener() {

    // Chromium and FireFox have different message APIs. Use the appropriate API based on the detected browser.
    let onMessageFn
    if (browserDescriptor === "chromium") {
        onMessageFn = chrome.runtime.onMessageExternal
    } else if (browserDescriptor === "firefox") {
        onMessageFn = browser.runtime.onMessage
    } else {
        throw new Error(`Unrecognized browserDescriptor: ${browserDescriptor}`)
    }

    onMessageFn.addListener(function (message, sender, sendResponse) {
        console.log(`[init.js] Received a message:`)
        console.dir(message)
        let {procedureName, procedureArgs} = message

        if (procedureName === "save") {
            chrome.storage.local.set(procedureArgs, () => {
                console.log("The extension successfully saved the data")
                sendResponse(true)
            })
        } else if (procedureName === "get") {
            let key = procedureArgs.key
            chrome.storage.local.get(key, (found) => {
                console.log("The extension successfully read the data")
                sendResponse(found)
            })
        } else if (procedureName === "open-generate-html-page") {
            chrome.tabs.create({
                url: 'web/generate-html.html'
            })
        } else {
            throw new Error(`Unrecognized procedure name: '${procedureName}'`)
        }

        return true // Returning "true" tells FireFox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
    })
}

// Add a click listener for the ephemeral "Generate HTML" page, where the HTML is generated but not downloaded.
// When the button is clicked, the "generate-html.html" page is opened.
function addGenerateHtmlListener() {
    chrome.browserAction()
}
