/**
 * This is a concrete implementation of AbstractRpcServer that is used in a background script in Firefox.
 */
class FirefoxBackgroundScriptRpcServer extends AbstractRpcServer {

    listen() {
        let that = this
        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            let {procedureName, procedureArgs} = message

            that.dispatch(procedureName, procedureArgs).then(returnValue => {
                sendResponse(returnValue)
            })
            return true // Returning "true" tells FireFox that we plan to invoke the "sendResponse" function later (rather, asynchronously). Otherwise, the "sendResponse" function would become invalid.
        })
    }
}
