// This code runs in the popup. It bootstraps the content scripts which then bootstrap the web page. It waits for user
// input when any of the "Scrape votes", "Expand posts", or "View posts" buttons are clicked in the popup.

import {getRpcServer, getRpcClient} from "../../rpc-framework/rpc-backend.ts"
import {chrome} from "../../web-extension-types/chrome-extension-types.d.ts"
import {executeInstrumentedContentScript} from "../../web-extension-framework/background-wiring.ts"

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

    await executeInstrumentedContentScript("/backend/content-script-bootstrapper.js")
})()

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
