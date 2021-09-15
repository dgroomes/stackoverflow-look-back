/**
 * An implementation of the RpcClient interface for Chromium browsers that runs in the web page and sends RPC requests
 * to an RPC server in a background script.
 */
class ChromiumWebPageToBackgroundRpcClient extends RpcClient {

    #webExtensionId

    constructor(webExtensionId) {
        super("background-server")
        this.#webExtensionId = webExtensionId
    }

    execRemoteProcedure(procedureName, procedureArgs) {
        let rpcRequest = this.createRequest(procedureName, procedureArgs)
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#webExtensionId, rpcRequest,
                function (returnValue) {
                    console.debug("[ChromiumWebPageToBackgroundRpcClient] Got a return value from the remote procedure call:")
                    console.debug({returnValue})
                    resolve(returnValue)
                })
        })
    }
}
