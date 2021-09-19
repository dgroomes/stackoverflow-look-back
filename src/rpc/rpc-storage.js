// This is code is meant to be called by extension background scripts.

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
            console.log(`[rpc-storage.js] Found rpcBrowserDescriptor: ${JSON.stringify(found, null, 2)}`)
            _browserDescriptor = found.rpcBrowserDescriptor
            if (typeof _browserDescriptor === "undefined") {
                reject()
                let msg = "[rpc-storage.js] 'rpcBrowserDescriptor' not found. The RPC framework must not have been initialized. Call the 'init(...)' function first."
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
