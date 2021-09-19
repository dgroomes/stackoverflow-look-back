// This is the entrypoint code that should run in the extension's JavaScript environment. This code should NOT run in a
// content script and should not run in the web page.
//
// This code bootstraps the content scripts which then bootstrap the web page.

console.debug("[extension-entrypoint.js] Initializing...")

let _initRpcServer = false

/**
 * Create an RPC server in the background script that will receive remote procedure call (RPC) requests from the front-end
 * and then executes those requests.
 */
async function initRpcServer() {
    if (_initRpcServer) return
    _initRpcServer = true
    let rpcServer = await getRpcServer()

    rpcServer.registerCallbackProcedure("save", (procedureArgs, resolve) => {
        chrome.storage.local.set(procedureArgs, () => {
            console.debug("The extension successfully saved the data")
            resolve(true)
        })
    })

    rpcServer.registerCallbackProcedure("get", (procedureArgs, resolve) => {
        let key = procedureArgs.key
        chrome.storage.local.get(key, (found) => {
            console.debug("The extension successfully read the data")
            resolve(found)
        })
    })

    rpcServer.listen()
}

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

let _initWebPage = false

/**
 * Load the web page with the extension JavaScript source code and wait for it's initialization.
 *
 * This function takes care of some heavy lifting. Through a mind-bending concoction of message passing, extension APIs
 * and asynchronous JavaScript (promises and async), it loads the source code on the web page and confirms when the web
 * page has finished executing the extension initialization code.
 *
 * @return {Promise} a promise that resolves when the web page is fully loaded and initialized with the extension source code.
 */
async function initWebPage() {
    if (_initWebPage) return
    _initWebPage = true
    await execContentScript("/rpc/rpc-content-script-proxy.js")
    await execContentScript("/rpc/rpc-content-script-load-source.js")

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

    await execContentScript("/backend/content-script-load-source.js")
    await webPageInitialized
}

/**
 * Execute a remote procedure on the web page.
 */
async function execProcedureInWebPage(procedureName) {
    await initRpcServer()
    await initWebPage()
    let rpcClient = await getRpcClient()
    rpcClient.execRemoteProcedure(procedureName)
}

document.getElementById("execute-scrape-votes")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'scrape votes' button`)
        await execProcedureInWebPage("scrape-votes")
    })


document.getElementById("execute-expand-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'expand posts' button`)
        await execProcedureInWebPage("expand-posts")
    })

document.getElementById("view-posts")
    .addEventListener("click", async () => {
        console.info(`[extension-entrypoint.js] Clicked the 'view posts' button`)

        chrome.tabs.create({
            url: '/web-page/posts-viewer.html'
        })
    })
