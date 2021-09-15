/**
 * An implementation of the RpcClient interface that runs in a background script and sends RPC requests to
 * a content script RPC proxy which then forwards the requests to an RPC server in the web page.
 */
class BackgroundToContentScriptRpcClient extends RpcClient {

    #tabId

    constructor(tabId) {
        super("content-script-rpc-proxy")
        this.#tabId = tabId
    }

    execRemoteProcedure(procedureName, procedureArgs) {
        let rpcRequest = this.createRequest(procedureName, procedureArgs)
        return chrome.tabs.sendMessage(this.#tabId, rpcRequest)
    }
}
