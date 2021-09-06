/**
 * An implementation of the RpcClient for the Firefox extension.
 *
 * It will initiate remote procedure calls by passing messages to the FireFox content-script and then to the extension
 * background scripts. Unfortunately, Firefox does not support direct page-to-background communication because it does
 * not support the "externally_connectable" Manifest field. So we must resort to page-to-contentscript-to-background
 * communication. This is a significant difference between Chromium and Firefox and it is worth encapsulating the
 * implementation details in this class.
 */
class FirefoxRpcClient extends RpcClient {

    #webExtensionId

    constructor(webExtensionId) {
        super()
        this.#webExtensionId = webExtensionId
    }

    #callerIdSequence = 0

    /**
     * This function uses the asynchronous broadcast messaging system of the "window" object plus Firefox's "runtime.sendMessage"
     * extension API to make a one-for-one request/response procedure call. Honestly, the implementation seems a little
     * strange but it makes for a great API to the calling code. I think this is an effective pattern.
     *
     * This function will send a message to the content-script proxy ("content-script-messaging-proxy.js") and then
     * register a listener on the window to listen for the eventual expected response message. A "caller ID" and
     * a "sender" property are used to filter out messages that may have been initiated by invocations of "#message" by
     * other callers.
     */
    execRemoteProcedure(procedureName, procedureArgs) {
        let callerId = this.#callerIdSequence++

        // I'm assuming it's wise to wire up the event listener before posting the message to avoid a race condition.
        // That's why I've put this before the "window.postMessage". But I don't think it actually matters.
        let returnValuePromise = new Promise((resolve => {
            window.addEventListener("message", function listenForCommandResponse({data}) {
                if (data.sender === "content-script-messaging-proxy"
                    && data.callerId === callerId) {

                    window.removeEventListener("message", listenForCommandResponse)
                    resolve(data.returnValue)
                }
            })
        }))

        window.postMessage({
            sender: "FirefoxRpcClient",
            callerId,
            procedureName,
            procedureArgs
        }, "*")

        return returnValuePromise
    }
}
