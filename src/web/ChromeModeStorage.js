/**
 * An implementation of the AppStorage interface for the "Chrome extension" mode.
 *
 * It will read and write domain data by passing messages to the Chrome extension.
 */
class ChromeModeStorage extends AppStorage {

    #chromeExtensionId

    constructor(chromeExtensionId) {
        super()
        this.#chromeExtensionId = chromeExtensionId
    }

    /**
     * Send a message to the extension back-end to execute a command. This is a remote procedure call (RPC).
     *
     * @param procedureName the "procedure name" of the remote procedure call.
     * @param procedureArgs the "procedure arguments" of the remote procedure call.
     * @return {Promise} a promise containing the return value of the remote procedure call
     */
    #execRemoteProcedure(procedureName, procedureArgs) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#chromeExtensionId, {procedureName, procedureArgs},
                function (returnValue) {
                    console.log("Got a return value from the remote procedure call:")
                    console.dir(returnValue)
                    resolve(returnValue)
                })
        })
    }

    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<Number>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return this.#execRemoteProcedure("get", {key: "votesPageLimit"})
            .then(returnValue => returnValue.votesPageLimit)
    }

    saveVotes(votes) {
        let votesMapped = votes.map(vote => vote.toJSON())

        return this.#execRemoteProcedure("save", {votes: votesMapped})
    }

    async getVotes() {
        return this.#execRemoteProcedure("get", {key: "votes"})
            .then(returnValue => {
                return returnValue.votes.map(voteData => Vote.deserialize(voteData))
            })
    }

    savePosts(posts) {
        let postsMapped = posts.map(post => post.toJSON())

        return this.#execRemoteProcedure("save", {posts: postsMapped})
    }

    // Warning: This is bad design. This method is implemented differently than the others. It does not make a "sendMessage"
    // request like the others but instead executes the "chrome.storage" API directly. This is because this function is
    // only called in an extension context and not a web page context. This stuff is really confusing! Anyway, it works!
    async getPosts() {
        let promise = new Promise(resolve => {
            chrome.storage.local.get("posts", (found) => {
                console.log("Got this response from storage:")
                console.dir(found)
                resolve(found.posts)
            })
        })

        let postsData = await promise
        return postsData.map(postData => Post.deserialize(postData))
    }
}
