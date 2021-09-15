/**
 * This is a concrete implementation of RpcServer for Chromium browsers that runs in a background script and services
 * RPC requests.
 */
class ChromiumBackgroundRpcServer extends RpcServer {

    constructor() {
        super("background-server")
    }

    listen() {
        let that = this
        chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
            if (!that.intake(message)) {
                return
            }

            that.dispatch(message).then(returnValue => {
                sendResponse(returnValue)
            })
        })
    }
}
