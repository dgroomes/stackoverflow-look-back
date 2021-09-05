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
    chrome.runtime.onMessageExternal.addListener(async function (message, sender, sendResponse) {
        console.log(`Received a message:`)
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
    })
}

