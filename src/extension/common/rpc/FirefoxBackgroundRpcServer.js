/**
 * This is a concrete implementation of RpcServer for Firefox that runs in a background script and services RPC requests.
 */
class FirefoxBackgroundRpcServer extends RpcServer {

    constructor() {
        super("background")
    }

    listen() {
        let that = this
        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            console.debug("[FirefoxBackgroundScriptRpcServer] received a message from the extension messaging system:")
            console.debug({message})

            if (!message.procedureTargetReceiver) return

            let {procedureTargetReceiver, procedureName, procedureArgs} = message

            that.dispatch(procedureTargetReceiver, procedureName, procedureArgs).then(returnValue => {
                sendResponse(returnValue)
            })
            return true // Returning "true" tells Firefox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
        })
    }
}
