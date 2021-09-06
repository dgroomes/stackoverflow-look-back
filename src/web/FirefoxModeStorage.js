/**
 * An implementation of the AppStorage interface for the "Firefox extension" mode.
 */
class FirefoxModeStorage extends AppStorage {

    #rpcClient

    constructor(rpcClient) {
        super()
        this.#rpcClient = rpcClient
    }

    #callerIdSequence = 0

    /**
     * This method is only available in the "web-extension" mode
     * @return {Promise<Number>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return this.#rpcClient.execRemoteProcedure("get", {
            key: "votesPageLimit"
        }).then(found => {
            return found.votesPageLimit
        })
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

    async getPosts() {
        throw new Error("Not yet implemented")
    }
}
