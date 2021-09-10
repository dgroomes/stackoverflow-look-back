/**
 * This is a concrete implementation of AbstractRpcServer that is used in a background script in Chromium browsers.
 */
class ChromiumBackgroundScriptRpcServer extends AbstractRpcServer {

    listen() {
        let that = this
        chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
            let {procedureName, procedureArgs} = message

            that.dispatch(procedureName, procedureArgs).then(returnValue => {
                sendResponse(returnValue)
            })
        })
    }
}
