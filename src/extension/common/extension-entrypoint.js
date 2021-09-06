// This is the entrypoint code that should run in the extension's JavaScript environment. This code should NOT run in a
// content script and should not run in the web page.
//
// This code bootstraps the content script which then bootstraps the web page.

console.log("[extension-entrypoint.js] Initializing...")

/**
 * Execute a content script.
 *
 * @param fileName the file name of the content script
 * @return {Promise} that resolves when the content script has been loaded/executed(?)
 */
async function execContentScript(fileName) {
    console.log(`[extension-entrypoint.js] Executing content script: ${fileName}`)
    return new Promise(resolve => {
        chrome.tabs.executeScript({
            file: fileName
        }, () => {
            resolve()
        })
    })
}

execContentScript("/extension/common/content-script-entrypoint.js")
    .then(() => console.log("[extension-entrypoint.js] Ran to completion"))
    .catch(e => console.log("[extension-entrypoint.js] Something went wrong", e))
