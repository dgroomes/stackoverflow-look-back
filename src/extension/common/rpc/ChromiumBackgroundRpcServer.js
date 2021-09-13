/**
 * This is a concrete implementation of RpcServer for Chromium browsers that runs in a background script and services
 * RPC requests.
 */
class ChromiumBackgroundRpcServer extends RpcServer {

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
