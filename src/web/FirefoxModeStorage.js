/**
 * An implementation of the AppStorage interface for the "Firefox extension" mode.
 *
 * It will read and write domain data by passing messages to the FireFox content-script and then to the extension.
 * Unfortunately, Firefox does not support direct page-to-extension communication because it does not support the
 * "externally_connectable" Manifest field. So we must resort to page-to-contentscript-to-extension communication.
 */
class FirefoxModeStorage extends AppStorage {

    #webExtensionId

    constructor(webExtensionId) {
        super()
        this.#webExtensionId = webExtensionId
    }

    #callerIdSequence = 0

    /**
     * Send a message to the extension back-end to execute a command. This is a remote procedure call (RPC).
     *
     * This function uses the asynchronous broadcast messaging system of the "window" object plus Firefox's "runtime.sendMessage"
     * extension API to make a one-for-one request/response procedure call. Honestly, the implementation seems a little
     * strange but it makes for a great API to the calling code. I think this is an effective pattern.
     *
     * This function will send a message to the content-script proxy ("content-script-messaging-proxy.js") and then
     * register a listener on the window to listen for the eventual expected response message. A "caller ID" and
     * a "sender" property are used to filter out messages that may have been initiated by invocations of "#message" by
     * other callers.
     *
     * @param procedureName the "procedure name" of the remote procedure call.
     * @param procedureArgs the "procedure arguments" of the remote procedure call.
     * @return {Promise} a promise containing the return value of the remote procedure call
     */
    #execRemoteProcedure(procedureName, procedureArgs) {
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
            sender: "FirefoxModeStorage.js",
            callerId,
            procedureName,
            procedureArgs
        }, "*")

        return returnValuePromise
    }

    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<Number>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return this.#execRemoteProcedure("get", {
            key: "votesPageLimit"
        }).then(found => {
            return found.votesPageLimit
        })
    }

    saveVotes(votes) {
        let votesMapped = votes.map(vote => vote.toJSON())

        return this.#execRemoteProcedure("save", {votes: votesMapped})
    }

    async getVotes() {
        throw new Error("Not yet implemented")
    }

    savePosts(posts) {
        throw new Error("Not yet implemented")
    }

    async getPosts() {
        throw new Error("Not yet implemented")
    }
}
