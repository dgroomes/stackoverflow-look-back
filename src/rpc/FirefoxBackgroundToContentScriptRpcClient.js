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
