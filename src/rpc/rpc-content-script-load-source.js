// This code should run in a content script and will load the web page with the web page components of the RPC framework.

console.debug("[rpc-content-script-load-source.js] Initializing...")

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
async function loadRpcOnWebPage() {
    await Promise.all([
        _includeScript("rpc/RpcClient.js"),
        _includeScript("rpc/RpcServer.js"),
        _includeScript("rpc/rpc-web-page-init.js")
    ])

    // These files depend on another file already having been loaded because they use the "extends" keyword at the
    // top-level. If I used the module system would this not be a problem?
    await Promise.all([
        _includeScript("rpc/ChromiumWebPageToBackgroundRpcClient.js"),
        _includeScript("rpc/FirefoxWebPageToContentScriptRpcClient.js"),
        _includeScript("rpc/ChromiumWebPageRpcServer.js"),
        _includeScript("rpc/FirefoxWebPageRpcServer.js")
    ])
}

loadRpcOnWebPage().then(() => console.debug("[rpc-content-script-load-source.js] The web page source components of the RPC framework have been loaded into the web page."))
