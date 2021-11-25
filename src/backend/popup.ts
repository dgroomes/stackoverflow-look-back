// This code runs in the popup. It bootstraps the content scripts which then bootstrap the web page. It waits for user
// input when any of the "Scrape votes", "Expand posts", or "View posts" buttons are clicked in the popup.

import {getRpcServer, getRpcClient} from "../rpc/rpc-backend.ts"
import {chrome} from "../chromium-manifest-v2/chrome-extension-types.d.ts";

console.debug("[popup.js] Initializing...")

const votesPageLimitEl = document.getElementById("votes-page-limit") as HTMLInputElement

/**
 * Initialize everything.
 *
 * - Create an RPC server in the background script that will receive remote procedure call (RPC) requests from the front-end
 *   and then executes those requests.
 *
 * - Load the web page with the extension JavaScript source code and wait for its initialization. Through a mind-bending
 *   concoction of message passing, extension APIs and asynchronous JavaScript (promises and async), load the source code
 *   on the web page and confirm when the web page has finished executing the extension initialization code.
 */
const initPromise = (async function () {
    const rpcServer = await getRpcServer()

    rpcServer.registerCallbackProcedure("save", (procedureArgs, resolve) => {
        chrome.storage.local.set(procedureArgs, () => {
            console.debug("The extension successfully saved the data")
            resolve(true)
        })
    })

    rpcServer.registerCallbackProcedure("get", (procedureArgs, resolve) => {
        const key = procedureArgs.key
        chrome.storage.local.get(key, (found) => {
            console.debug("The extension successfully read the data")
            resolve(found)
        })
    })

    rpcServer.listen()

    await execContentScript("/rpc/rpc-content-script.js")

    const webPageInitialized = new Promise(resolve => {
        console.debug(`[popup.js] [${Date.now()}] Registering listener for 'web-page-initialized'`)
        chrome.runtime.onMessage.addListener(function webPageInitializedListener(message, _sender, _sendResponse) {
            console.debug("[popup.js] Received a message from the extension messaging system:")
            console.debug(JSON.stringify({message}, null, 2))
            if (message === "web-page-initialized") {
                console.debug(`[popup.js] Detected that the extension source has been loaded into the web page and fully initialized `)
                resolve("success_ignored_value")
                chrome.runtime.onMessage.removeListener(webPageInitializedListener)
            }
        })
    })

    await execContentScript("/backend/content-script-load-source.js")
    await webPageInitialized
})()

/**
 * Execute a content script.
 *
 * @param fileName the file name of the content script
 * @return {Promise} that resolves when the content script has been loaded/executed(?)
 */
async function execContentScript(fileName) {
    console.debug(`[popup.js] Executing content script: ${fileName}`)
    return new Promise(resolve => {
        chrome.tabs.executeScript({
            file: fileName
        }, () => {
            resolve("success_ignored_value")
        })
    })
}

document.getElementById("execute-scrape-votes")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'scrape votes' button`)
        const votesPageLimit = votesPageLimitEl.value

        await initPromise
        const rpcClient = await getRpcClient()
        const votesScraped = await rpcClient.execRemoteProcedure("scrape-votes", {votesPageLimit})
        console.info(`[popup.js] ${votesScraped} votes scraped!`)
    })


document.getElementById("execute-expand-posts")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'expand posts' button`)
        await initPromise
        const rpcClient = await getRpcClient()
        const postsExpanded = await rpcClient.execRemoteProcedure("expand-posts", null)
        console.info(`[popup.js] ${postsExpanded} posts expanded!`)
    })

document.getElementById("view-posts")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'view posts' button`)

        chrome.tabs.create({
            url: '/web-page/posts-viewer.html'
        })
    })
