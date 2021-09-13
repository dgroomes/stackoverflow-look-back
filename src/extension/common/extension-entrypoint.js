// This is the entrypoint code that should run in the extension's JavaScript environment. This code should NOT run in a
// content script and should not run in the web page.
//
// This code bootstraps the content scripts which then bootstrap the web page.

console.debug("[extension-entrypoint.js] Initializing...")

/**
 * Execute a content script.
 *
 * @param fileName the file name of the content script
 * @return {Promise} that resolves when the content script has been loaded/executed(?)
 */
async function execContentScript(fileName) {
    console.debug(`[extension-entrypoint.js] Executing content script: ${fileName}`)
    return new Promise(resolve => {
        chrome.tabs.executeScript({
            file: fileName
        }, () => {
            resolve()
        })
    })
}

let messagingProxyPromise = execContentScript("/extension/common/content-script-messaging-proxy.js")

document.getElementById("execute-scrape-votes")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'scrape votes' button`)

        await messagingProxyPromise
        await execContentScript("/extension/common/content-script-load-source.js")
        await execContentScript("/extension/common/content-script-scrape-votes.js")
    })


document.getElementById("execute-expand-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'expand posts' button`)

        await messagingProxyPromise
        await execContentScript("/extension/common/content-script-load-source.js")
        await execContentScript("/extension/common/content-script-expand-posts.js")
    })

document.getElementById("view-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'view posts' button`)

        chrome.tabs.create({
            url: '/web/posts-viewer.html'
        })
    })
