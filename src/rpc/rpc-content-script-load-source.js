// This code should run in a content script and will load the web page with the web page components of the RPC framework.

if (!window.rpcContentScriptLoadSourceLoaded) {
    console.debug("[rpc-content-script-load-source.js] Loading...")
    window.rpcContentScriptLoadSourceLoaded = true
    loadRpcSourceOnWebPage().then(() => console.debug("[rpc-content-script-load-source.js] The web page source components of the RPC framework have been loaded into the web page."))
} else {
    console.debug("[rpc-content-script-load-source.js] Already loaded.")
}

/**
 * Include a script dependency.
 *
 * This creates a <script> element with the given URL and adds it to the document head. The script will be downloaded and
 * run. This is a way to dynamically load JavaScript to the page.
 * @param fileName
 * @return {Promise} a promise that resolves when the script loads
 */
function _includeScript(fileName) {
    let el = document.createElement("script")
    el.src = chrome.runtime.getURL(fileName)
    document.head.append(el)

    return new Promise(resolve => {
        el.onload = function () {
            resolve()
        }
    })
}

/**
 * Load the web page source code components of the RPC framework into the web page.
 * @return {Promise<void>}
 */
async function loadRpcSourceOnWebPage() {
    await _includeScript("rpc/rpc.js")
    await _includeScript("rpc/rpc-web-page.js")
}
