/**
 * An implementation of the AppStorage interface for the "Firefox extension" mode.
 *
 * It will read and write domain data by passing messages to the FireFox content-script and then to the extension.
 * Unfortunately, Firefox does not support direct page-to-extension communication because it does not support the
 * "externally_connectable" Manifest field. So we must resort to page-to-contentscript-to-extension communication.
 */
class FirefoxModeStorage extends AppStorage {

    #FIREFOX_STORAGE = "Firefox storage"
    #webExtensionId

    constructor(webExtensionId) {
        super()
        this.#webExtensionId = webExtensionId
    }

    #callerIdSequence = 0

    /**
     * Send a message to the extension back-end (the content-script and background scripts).
     *
     * This is effectively a remote procedure call. This function uses the asynchronous broadcast messaging system and
     * creates a one-for-one request/response procedure call. Honestly, the implementation seems a little strange
     * but it makes for a great API to the calling code. I think this is an effective pattern.
     *
     * This function will send a message to the content-script proxy ("content-script-messaging-proxy.js") and then
     * register a listener on the window to listen for the eventual expected response message. A "caller ID" and
     * a "sender" property are used to filter out messages that may have been initiated by invocations of "#message" by
     * other callers.
     *
     * @param command the command that the back-end should execute. This is the "procedure name" of the remote procedure call.
     * @param payload the payload of the message to send
     * @return {Promise} a promise containing the response message
     */
    #message(command, payload) {
        let callerId = this.#callerIdSequence++

        // I'm assuming it's wise to wire up the event listener before posting the message to avoid a race condition.
        // That's why I've put this before the "window.postMessage". But I don't think it actually matters.
        let responsePromise = new Promise((resolve => {
            window.addEventListener("message", function listenForCommandResponse({data}) {
                if (data.sender === "content-script-messaging-proxy"
                    && data.callerId === callerId) {

                    window.removeEventListener("message", listenForCommandResponse)
                    resolve(data.payload)
                }
            })
        }))

        window.postMessage({
            sender: "FirefoxModeStorage.js",
            callerId,
            command,
            payload
        }, "*")

        return responsePromise
    }

    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<Number>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return this.#message("get", {
            key: "votesPageLimit"
        }).then((found) => {
            return found.votesPageLimit
        })
    }

    saveVotes(votes) {
        let that = this
        let votesMapped = votes.map(vote => vote.toJSON())

        return this.#message("save", {votes: votesMapped})
            .then(() => {
                return that.#FIREFOX_STORAGE
            })
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
