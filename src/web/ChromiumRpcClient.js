/**
 * An implementation of the RpcClient interface for the Chromium extension.
 */
class ChromiumRpcClient extends RpcClient {

    #webExtensionId

    constructor(webExtensionId) {
        super()
        this.#webExtensionId = webExtensionId
    }

    execRemoteProcedure(procedureName, procedureArgs) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#webExtensionId, {procedureName, procedureArgs},
                function (returnValue) {
                    console.log("Got a return value from the remote procedure call:")
                    console.dir(returnValue)
                    resolve(returnValue)
                })
        })
    }
}
