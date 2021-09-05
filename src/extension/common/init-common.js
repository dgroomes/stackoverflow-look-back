// This is the common code that is imported by the unique "init.js" files which are defined for each plugin.
// Register a listener for message passing to the web page.

/**
 * Set a default value for the 'votesPageLimit' configuration
 */
function setDefaultConfig() {
    const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.log(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`);
    })
}

/**
 * Register a listener in the background script that will receive commands from the front-end.
 */
function addCommandsListener() {

    // Chrome and FireFox have different message APIs. Detect the browser and use the correct API.
    let browserName = detectBrowser()
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

        if (message.command === "save") {
            let data = message.data
            chrome.storage.local.set(data, () => {
                sendResponse("The extension successfully saved the data")
            })
        } else if (message.command === "get") {
            let key = message.key
            chrome.storage.local.get(key, (found) => {
                sendResponse(found)
            })
        } else if (message.command === "open-generate-html-page") {
            chrome.tabs.create({
                url: 'web/generate-html.html'
            })
        } else {
            throw new Error(`Unrecognized command: '${message.command}'`)
        }

        return true // Returning "true" tells FireFox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
    })
}

/**
 * Detect the current browser.
 *
 * This function uses the origin to detect what the current browser is.
 *
 * @return {String} chrome or firefox
 */
function detectBrowser() {
    let {origin} = window;

    if (origin.startsWith("chrome-extension://")) {
        return "chrome"
    } else if (origin.startsWith("moz-extension://")) {
        return "firefox"
    } else {
        throw new Error(`Unrecognized origin. Could not detect the browser from the origin: ${origin}`)
    }
}

/**
 * JSONify an object. This is especially useful for logging.
 */
function jsonify(obj) {
    return JSON.stringify(obj, null, 2)
}
