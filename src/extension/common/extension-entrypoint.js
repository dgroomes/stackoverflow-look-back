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

/**
 * Load the web page with the extension JavaScript source code and wait for it's initialization.
 *
 * This function takes care of some heavy lifting. Through a mind-bending concoction of message passing, extension APIs
 * and asynchronous JavaScript (promises and async), it loads the source code on the web page and confirms when the web
 * page has finished executing the extension initialization code.
 *
 * @return {Promise} a promise that resolves when the web page is fully loaded and initialized with the extension source code.
 */
async function initializeWebPage() {
    await execContentScript("/rpc/content-script-rpc-proxy.js")

    let webPageInitialized = new Promise(resolve => {
        console.debug(`[extension-entrypoint.js] [${Date.now()}] Registering listener for 'web-page-initialized'`)
        chrome.runtime.onMessage.addListener(function webPageInitializedListener(message, sender, sendResponse) {
            console.debug("[extension-entrypoint.js] Received a message from the extension messaging system:")
            console.debug(JSON.stringify({message}, null, 2))
            if (message === "web-page-initialized") {
                console.debug(`[extension-entrypoint.js] Detected that the extension source has been loaded into the web page and fully initialized `)
                resolve()
                chrome.runtime.onMessage.removeListener(webPageInitializedListener)
            }
        })
    })

    await execContentScript("/extension/common/content-script-load-source.js")
    await webPageInitialized
}

/**
 * Execute a remote procedure on the web page.
 *
 * Warning: this codes to Firefox-specific APIs. There should be a Chrome equivalent API for getting the tab ID.
 */
async function execProcedureInWebPage(procedureName) {
    let rpcClient = await new Promise(resolve => {
        chrome.tabs.query({active: true}, results => {
            let activeTab = results[0] // The "query" function returns an array of results, but when searching for the "active" tab there of course can only be one. It is the first element in the array.
            resolve(new BackgroundToContentScriptRpcClient(activeTab.id))
        })
    })

    rpcClient.execRemoteProcedure(procedureName)
}

document.getElementById("execute-scrape-votes")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'scrape votes' button`)
        await initializeWebPage()
        await execProcedureInWebPage("scrape-votes")
    })


document.getElementById("execute-expand-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'expand posts' button`)
        await initializeWebPage()
        await execProcedureInWebPage("expand-posts")
    })

document.getElementById("view-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'view posts' button`)

        chrome.tabs.create({
            url: '/web/posts-viewer.html'
        })
    })
