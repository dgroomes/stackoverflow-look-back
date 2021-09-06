/**
 * An implementation of the AppStorage interface for the "Chrome extension" mode.
 */
class ChromeModeStorage extends AppStorage {
    
    #rpcClient
    
    constructor(rpcClient) {
        super()
        this.#rpcClient = rpcClient
    }
    
    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<Number>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return this.#rpcClient.execRemoteProcedure("get", {key: "votesPageLimit"})
            .then(returnValue => returnValue.votesPageLimit)
    }

    saveVotes(votes) {
        let votesMapped = votes.map(vote => vote.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {votes: votesMapped})
    }

    async getVotes() {
        return this.#rpcClient.execRemoteProcedure("get", {key: "votes"})
            .then(returnValue => {
                return returnValue.votes.map(voteData => Vote.deserialize(voteData))
            })
    }

    savePosts(posts) {
        let postsMapped = posts.map(post => post.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {posts: postsMapped})
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
