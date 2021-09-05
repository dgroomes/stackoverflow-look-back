// This is the entrypoint code that should run in the extension's JavaScript environment. This code should NOT run in a
// content script and should not run in the web page.
//
// This code bootstraps the content script which then bootstraps the web page.

console.log("[extension-entrypoint.js] Initializing...")

/**
 * Execute a content script.
 *
 * Special care is taken to abstract between the Manifest V2 and V3 APIs.
 * See the contrast between how to execute scripts between the Manifest V2 and V3 APIs: https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#executing-arbitrary-strings
 *
 * @param fileName the file name of the content script
 * @return {Promise} that resolves when the content script has been loaded/executed(?)
 */
async function execContentScript(fileName) {
    console.log(`Executing content script: ${fileName}`)

    // Detect which version of the manifest this extension is defined as (e.g. Manifest V2 or V3)
    // The value will be a number: either 2 or 3.
    let manifestVersion = chrome.runtime.getManifest().manifest_version

    if (manifestVersion === 2) {
        chrome.tabs.executeScript({
            file: fileName
        })
    } else if (manifestVersion === 3) {
        // Get the current tab
        let [tab] = await chrome.tabs.query({active: true, currentWindow: true})

        // Create the content script entrypoint
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: [fileName]
        })
    } else {
        console.error(`Chrome manifest version not recognized: ${manifestVersion}`)
    }
}

execContentScript("/extension/common/content-script-entrypoint.js")
    .then(() => console.log("[extension-entrypoint.js] Ran to completion"))
    .catch(e => console.log("[extension-entrypoint.js] Something went wrong", e))
