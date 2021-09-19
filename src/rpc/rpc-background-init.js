// This code is meant to be called by extension background scripts.

/**
 * Initialize the configuration for the RPC framework. This must always be executed before any other work is done.
 *
 * @param browserDescriptor either "chromium" or "firefox"
 * @return {Promise} a promise that returns when the initialization work is done.
 */
function initRpcBackground(browserDescriptor) {
    return setBrowserDescriptor(browserDescriptor)
}

let _rpcServer = null

/**
 * Instantiate a background RPC server.
 *
 * @return {Promise<RpcServer>}
 */
async function getRpcServer() {
    if (_rpcServer !== null) return _rpcServer

    let browserDescriptor = await getBrowserDescriptor()

    if (browserDescriptor === "chromium") {
        _rpcServer = new ChromiumBackgroundRpcServer()
    } else if (browserDescriptor === "firefox") {
        _rpcServer = new FirefoxBackgroundRpcServer()
    } else {
        throw new Error(`Unexpected browser: '${browserDescriptor}'. Expected either 'chromium' or 'firefox'`)
    }

    return _rpcServer
}

let _rpcClient = null

/**
 * Instantiate a background RPC client instance to make requests to the web page.
 *
 * It's necessary to find the active browser tab.
 *
 * @return {RpcClient}
 */
async function getRpcClient() {
    if (_rpcClient !== null) return _rpcClient

    let activeTab = await new Promise(resolve => {
        chrome.tabs.query({active: true}, results => {
            let activeTab = results[0] // The "query" function returns an array of results, but when searching for the "active" tab there of course can only be one. It is the first element in the array.
            resolve(activeTab)
        })
    })

    let browserDescriptor = await getBrowserDescriptor()

    // For now, the background to content script RPC client is the same for Chromium and Firefox but when I implement
    // the "passing of the return value" there will need to be different implementations for Chromium and Firefox.
    if (browserDescriptor === "chromium") {
        _rpcClient = new BackgroundToContentScriptRpcClient(activeTab.id)
    } else if (browserDescriptor === "firefox") {
        _rpcClient = new BackgroundToContentScriptRpcClient(activeTab.id)
    } else {
        throw new Error(`Unexpected browser: '${browserDescriptor}'. Expected either 'chromium' or 'firefox'`)
    }

    return _rpcClient
}
