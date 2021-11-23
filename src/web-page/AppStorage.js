export {AppStorage}

/**
 * An API for general storage and retrieval (i.e. reads/writes) of the domain data.
 */
class AppStorage {

    #rpcClient

    constructor(rpcClient) {
        this.#rpcClient = rpcClient
    }

    /**
     * Save the votes data to storage
     *
     * @param {Array<Vote>} votes
     * @return {Promise<String>} a promise that resolves when the votes have been successfully saved. The promise's string value indicates which storage backend was used.
     */
    saveVotes(votes) {
        let votesMapped = votes.map(vote => vote.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {votes: votesMapped})
    }

    /**
     * Read the votes data from storage.
     * @return {Array<Vote>}
     */
    async getVotes() {
        return this.#rpcClient.execRemoteProcedure("get", {key: "votes"})
            .then(returnValue => {
                return returnValue.votes.map(voteData => Vote.deserialize(voteData))
            })
    }

    /**
     * Saves posts data to storage
     * @param {Array<Post>}
     * @return {Promise}
     */
    savePosts(posts) {
        let postsMapped = posts.map(post => post.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {posts: postsMapped})
    }

    /**
     * Get posts data from storage
     * @return {Array<Post>} posts
     */
    async getPosts() {
        let promise = new Promise(resolve => {
            chrome.storage.local.get("posts", (found) => {
                console.debug("Got this response from storage:")
                console.debug({found})
                resolve(found.posts)
            })
        })

        let postsData = await promise
        return postsData.map(postData => Post.deserialize(postData))
    }
}

