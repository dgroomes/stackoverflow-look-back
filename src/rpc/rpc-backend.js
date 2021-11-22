// This code is designed to run in background scripts.

export {initRpcBackground, getRpcServer, getRpcClient}

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

// Cache a copy of the browserDescriptor. The value of the browser descriptor will never change because of course the
// browser can't change. If we are in Firefox, then we are Firefox. The browser descriptor will always be "firefox" so
// we might as well cache the value.
let _browserDescriptor = null

/**
 * Get the browser descriptor from storage.
 *
 * @return {Promise<String>} the browser descriptor. The value is either "chromium" of "firefox"
 */
function getBrowserDescriptor() {
    if (_browserDescriptor !== null) return _browserDescriptor
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["rpcBrowserDescriptor"], (found) => {
            console.log(`[rpc-backend.js] Found rpcBrowserDescriptor: ${JSON.stringify(found, null, 2)}`)
            _browserDescriptor = found.rpcBrowserDescriptor
            if (typeof _browserDescriptor === "undefined") {
                reject()
                let msg = "[rpc-backend.js] 'rpcBrowserDescriptor' not found. The RPC framework must not have been initialized. Call the 'init(...)' function first."
                console.error(msg)
                throw Error(msg)
            }
            resolve(_browserDescriptor)
        })
    })
}

/**
 * Set the browser descriptor to storage
 *
 * @param {String} browserDescriptor
 * @return {Promise} a promise that resolves when the value has been saved.
 */
function setBrowserDescriptor(browserDescriptor) {
    _browserDescriptor = browserDescriptor
    return new Promise(resolve => {
        chrome.storage.local.set({
            rpcBrowserDescriptor: browserDescriptor
        }, () => {
            resolve()
        })
    })
}

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
        _rpcClient = new ChromiumBackgroundToContentScriptRpcClient(activeTab.id)
    } else if (browserDescriptor === "firefox") {
        _rpcClient = new FirefoxBackgroundToContentScriptRpcClient(activeTab.id)
    } else {
        throw new Error(`Unexpected browser: '${browserDescriptor}'. Expected either 'chromium' or 'firefox'`)
    }

    return _rpcClient
}

/**
 * This is a concrete implementation of RpcServer for Chromium browsers that runs in a background script and services
 * RPC requests.
 */
class ChromiumBackgroundRpcServer extends RpcServer {

    constructor() {
        super("background-server")
    }

    listen() {
        let that = this
        chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
            if (!that.intake(message)) {
                return
            }

            that.dispatch(message).then(returnValue => {
                sendResponse(returnValue)
            })
        })
    }
}

/**
 * This is a concrete implementation of RpcServer for Firefox that runs in a background script and services RPC requests.
 */
class FirefoxBackgroundRpcServer extends RpcServer {

    constructor() {
        super("background-server")
    }

    listen() {
        let that = this
        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (!that.intake(message)) {
                return false
            }

            that.dispatch(message).then(returnValue => {
                sendResponse(returnValue)
            })
            return true // Returning "true" tells Firefox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
        })
    }
}

/**
 * An implementation of the RpcClient interface for Chromium that runs in a background script and sends RPC requests to
 * a content script RPC proxy which then forwards the requests to an RPC server in the web page. Finally, the web page
 * sends a return value to the background.
 */
class ChromiumBackgroundToContentScriptRpcClient extends RpcClient {

    #tabId

    constructor(tabId) {
        super("content-script-rpc-proxy")
        this.#tabId = tabId
    }

    async execRemoteProcedure(procedureName, procedureArgs) {
        let rpcRequest = this.createRequest(procedureName, procedureArgs)

        let responsePromise = new Promise(resolve => {
            console.debug(`[ChromiumBackgroundToContentScriptRpcClient] Registering listener on the messaging system to listen for RPC return value...`)
            chrome.runtime.onMessageExternal.addListener(function returnValueListener(message) {
                console.debug(`[ChromiumBackgroundToContentScriptRpcClient] Received message:`)
                console.debug(JSON.stringify({message}, null, 2))
                if (message.procedureTargetReceiver === "background-client") {
                    resolve(message.procedureReturnValue)
                    chrome.runtime.onMessageExternal.removeListener(returnValueListener)
                }
            })
        })

        await chrome.tabs.sendMessage(this.#tabId, rpcRequest)
        return await responsePromise
    }
}

/**
 * An implementation of the RpcClient interface for Firefox that runs in a background script and sends RPC requests to
 * a content script RPC proxy which then forwards the requests to an RPC server in the web page.
 */
class FirefoxBackgroundToContentScriptRpcClient extends RpcClient {

    #tabId

    constructor(tabId) {
        super("content-script-rpc-proxy")
        this.#tabId = tabId
    }

    async execRemoteProcedure(procedureName, procedureArgs) {
        let rpcRequest = this.createRequest(procedureName, procedureArgs)
        rpcRequest.procedureCaptureReturnValue = true
        return await browser.tabs.sendMessage(this.#tabId, rpcRequest)
    }
}
