// This is the common code that is imported by the unique "init.js" files which are defined for each plugin.
// Register a listener for message passing to the web page.

/**
 * Set a default value for the 'votesPageLimit' configuration
 */
function setDefaultConfig() {
    const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.log(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`)
    })
}

/**
 * Register a listener in the background script that will receive commands from the front-end.
 */
function addCommandsListener() {

    // Chrome and FireFox have different message APIs. Use the appropriate API based on the detected browser.
    let onMessageFn
    if (browserName === "chrome") {
        onMessageFn = chrome.runtime.onMessageExternal
    } else if (browserName === "firefox") {
        onMessageFn = browser.runtime.onMessage
    } else {
        throw new Error(`Unrecognized browserName: ${browserName}`)
    }

    onMessageFn.addListener(function (message, sender, sendResponse) {
        console.log(`[init.js] Received a message:`)
        console.dir(message)
        let {command, payload} = message

        if (command === "save") {
            chrome.storage.local.set(payload, () => {
                sendResponse("The extension successfully saved the data")
            })
        } else if (command === "get") {
            let key = payload.key
            chrome.storage.local.get(key, (found) => {
                sendResponse(found)
            })
        } else if (command === "open-generate-html-page") {
            chrome.tabs.create({
                url: 'web/generate-html.html'
            })
        } else {
            throw new Error(`Unrecognized command: '${command}'`)
        }

        return true // Returning "true" tells FireFox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
    })
}
