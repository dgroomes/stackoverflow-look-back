// Note: this code runs on the web page.

/**
 *  Initialize the web page objects of the RPC framework. Programs that depend on the RPC framework must call this
 *  function.
 *
 *  The window will be initialized with instances of RpcClient and RpcServer on the global variables "rpcClient" and
 *  "rpcServer" respectively.
 *
 *  @param browserDescriptor either "chromium" or "firefox" are supported
 *  @param webExtensionId
 */
function initRpc(browserDescriptor, webExtensionId) {
    console.debug("[rpc-web-page-init.js] Initializing...")
    let rpcClient
    let rpcServer

    if (browserDescriptor === "chromium") {
        rpcClient = new ChromiumWebPageToBackgroundRpcClient(webExtensionId)
        rpcServer = new ChromiumWebPageRpcServer()
    } else if (browserDescriptor === "firefox") {
        rpcClient = new FirefoxWebPageToContentScriptRpcClient(webExtensionId)
        rpcServer = new FirefoxWebPageRpcServer()
    } else {
        throw new Error(`Unexpected browser: ${browserDescriptor}. Expected either 'chromium' or 'firefox'`)
    }

    /**
     * Assign the RPC objects to the window. A function declaration is necessary to help intellisense in the IDE.
     * @param {RpcClient} rpcClient
     * @param {RpcServer} rpcServer
     */
    (function assignPolymorphicGlobals(rpcClient, rpcServer) {
        window.rpcClient = rpcClient
        window.rpcServer = rpcServer
    })(rpcClient, rpcServer)
}
