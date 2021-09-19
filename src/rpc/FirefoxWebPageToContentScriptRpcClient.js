/**
 * An implementation of the RpcClient for Firefox that runs in the web page and sends RPC requests to a content script
 * RPC gateway which then forwards the requests to an RPC server in a background script.
 *
 * It will initiate remote procedure calls by passing messages to the Firefox content-script and then to the extension
 * background scripts. Unfortunately, Firefox does not support direct page-to-background communication because it does
 * not support the "externally_connectable" Manifest field. So we must resort to page-to-contentscript-to-background
 * communication. This is a significant difference between Chromium and Firefox and it is worth encapsulating the
 * implementation details in this class.
 */
class FirefoxWebPageToContentScriptRpcClient extends RpcClient {

    #webExtensionId

    constructor(webExtensionId) {
        super("content-script-rpc-proxy")
        this.#webExtensionId = webExtensionId
    }

    /**
     * This function uses the asynchronous broadcast messaging system of the "window" object plus Firefox's "runtime.sendMessage"
     * extension API to make a one-for-one request/response procedure call. Honestly, the implementation seems a little
     * strange but it makes for a great API to the calling code. I think this is an effective pattern.
     *
     * This function will send a message to the content-script RPC proxy ("rpc-content-script-proxy.js") and then
     * register a listener on the window to listen for the eventual expected response message.
     */
    execRemoteProcedure(procedureName, procedureArgs) {
        // I'm assuming it's wise to wire up the event listener before posting the message to avoid a race condition.
        // That's why I've put this before the "window.postMessage". But I don't think it actually matters.
        let returnValuePromise = new Promise((resolve => {
            window.addEventListener("message", function listenForRpcResponse({data}) {
                if (data.procedureTargetReceiver === "web-page-client"
                    && data.procedureName === procedureName) {

                    window.removeEventListener("message", listenForRpcResponse)
                    resolve(data.procedureReturnValue)
                }
            })
        }))

        let rpcRequest = this.createRequest(procedureName, procedureArgs)
        window.postMessage(rpcRequest, "*")

        return returnValuePromise
    }
}
