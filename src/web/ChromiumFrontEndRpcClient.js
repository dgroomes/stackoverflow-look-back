/**
 * An implementation of the RpcClient interface for the Chromium extension that runs in the web page
 */
class ChromiumFrontEndRpcClient extends RpcClient {

    #webExtensionId

    constructor(webExtensionId) {
        super()
        this.#webExtensionId = webExtensionId
    }

    execRemoteProcedure(procedureName, procedureArgs) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#webExtensionId, {procedureName, procedureArgs},
                function (returnValue) {
                    console.debug("Got a return value from the remote procedure call:")
                    console.debug({returnValue})
                    resolve(returnValue)
                })
        })
    }
}
