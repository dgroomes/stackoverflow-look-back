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

    /**
     * Wait for a response message for the given caller.
     *
     * This function will register a listener on the window and listen for messages sent from the content-script
     * proxy ("content-script-messaging-proxy.js") until it finds the expected response message for the given "caller ID".
     *
     * @param callerId the ID of the caller that originally sent this message. For example, "get", "save"
     * @return {Promise} a promise containing the response message
     */
    #waitForMessage(callerId) {
        return new Promise((resolve => {
            window.addEventListener("message", function listenForCommandResponse({data}) {
                if (data.sender === "content-script-messaging-proxy"
                    && data.callerId === callerId) {

                    window.removeEventListener("message", listenForCommandResponse)
                    resolve(data.payload)
                }
            })
        }))
    }

    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<*>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        let callerId = "getVotesPageLimit"
        let promise = this.#waitForMessage(callerId)

        window.postMessage({
            sender: "FirefoxModeStorage.js",
            callerId,
            payload: {
                command: "get",
                key: "votesPageLimit"
            }
        }, "*")

        return promise.then((found) => {
            return found.votesPageLimit
        })
    }

    saveVotes(votes) {
        let that = this
        let votesMapped = votes.map(vote => vote.toJSON())

        let callerId = "saveVotes"
        let promise = this.#waitForMessage(callerId)

        window.postMessage({
            sender: "FirefoxModeStorage.js",
            callerId,
            payload: {
                command: "saved",
                data: {votes: votesMapped}
            }
        }, "*")

        return promise.then(() => {
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
