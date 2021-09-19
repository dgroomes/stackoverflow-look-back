/**
 * This is a concrete implementation of RpcServer for Firefox that runs in the web page and services RPC requests.
 */
class FirefoxWebPageRpcServer extends RpcServer {

    constructor() {
        super("web-page-server")
    }

    listen() {
        let that = this
        window.addEventListener("message", async ({data}) => {
            if (!that.intake(data)) {
                return false
            }

            let procedureReturnValue = await that.dispatch(data)

            let {procedureName} = data
            // Send the procedure return value to the RPC client by way of the RPC proxy.
            let returnMessage = {
                procedureTargetReceiver: "content-script-rpc-proxy",
                procedureName,
                procedureReturnValue
            }
            console.debug(`[FirefoxWebPageRpcServer] sending message:`)
            console.debug(JSON.stringify(returnMessage, null, 2))
            window.postMessage(returnMessage)
        })
    }
}
