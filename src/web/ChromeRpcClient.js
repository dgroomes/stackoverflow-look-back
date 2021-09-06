/**
 * An implementation of the RpcClient interface for the Chrome extension.
 */
class ChromeRpcClient extends RpcClient {

    #chromeExtensionId

    constructor(chromeExtensionId) {
        super()
        this.#chromeExtensionId = chromeExtensionId
    }

    execRemoteProcedure(procedureName, procedureArgs) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#chromeExtensionId, {procedureName, procedureArgs},
                function (returnValue) {
                    console.log("Got a return value from the remote procedure call:")
                    console.dir(returnValue)
                    resolve(returnValue)
                })
        })
    }
}
