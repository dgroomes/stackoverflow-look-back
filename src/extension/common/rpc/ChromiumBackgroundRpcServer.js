/**
 * This is a concrete implementation of RpcServer for Chromium browsers that runs in a background script and services
 * RPC requests.
 */
class ChromiumBackgroundRpcServer extends RpcServer {

    constructor() {
        super("background")
    }

    listen() {
        let that = this
        chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
            if (!message.procedureTargetReceiver) return

            let {procedureTargetReceiver, procedureName, procedureArgs} = message

            that.dispatch(procedureTargetReceiver, procedureName, procedureArgs).then(returnValue => {
                sendResponse(returnValue)
            })
        })
    }
}
