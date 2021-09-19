/**
 * This is a concrete implementation of RpcServer for Chromium that runs in the web page and services RPC requests.
 */
class ChromiumWebPageRpcServer extends RpcServer {

    #webExtensionId

    constructor(webExtensionId) {
        super("web-page-server")
        this.#webExtensionId = webExtensionId
    }

    listen() {
        let that = this
        window.addEventListener("message", ({data}) => {
            if (!that.intake(data)) {
                return false
            }

            let {procedureName} = data

            that.dispatch(data).then(returnValue => {
                // Send the procedure return value to the RPC client (it's assumed that the client is in a background
                // script or popup script).
                let returnMessage = {
                    procedureTargetReceiver: "background-client",
                    procedureName,
                    returnValue
                }
                console.debug(`[ChromiumWebPageRpcServer] sending message:`)
                console.debug(JSON.stringify(returnMessage, null, 2))
                chrome.runtime.sendMessage(that.#webExtensionId, returnMessage)
            })
        })
    }
}
