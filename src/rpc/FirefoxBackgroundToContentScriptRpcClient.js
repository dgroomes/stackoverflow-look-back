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

    // This returns a dummy value. It will take quite a bit of work to implement a return value because Firefox doesn't
    // have the "externally_connectable" feature that Chromium browsers have which allows the web page to send messages
    // directly to a background listener.
    async execRemoteProcedure(procedureName, procedureArgs) {
        let rpcRequest = this.createRequest(procedureName, procedureArgs)
        await chrome.tabs.sendMessage(this.#tabId, rpcRequest)
        return "'Not implemented for Firefox'"
    }
}
