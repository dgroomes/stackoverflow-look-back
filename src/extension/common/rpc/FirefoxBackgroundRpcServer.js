/**
 * This is a concrete implementation of RpcServer for Firefox that runs in a background script and services RPC requests.
 */
class FirefoxBackgroundRpcServer extends RpcServer {

    listen() {
        let that = this
        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            let {procedureName, procedureArgs} = message

            that.dispatch(procedureName, procedureArgs).then(returnValue => {
                sendResponse(returnValue)
            })
            return true // Returning "true" tells Firefox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
        })
    }
}
