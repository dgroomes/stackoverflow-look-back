/**
 * An implementation of the AppStorage interface for the "Chrome extension" mode.
 *
 * It will read and write domain data by passing messages to the Chrome extension.
 *
 * Consider DRYing up the sendMessage and Promise boilerplate where it is re-used multiple times
 */
class ChromeModeStorage extends AppStorage {

    #CHROME_STORAGE = "Chrome storage"
    #chromeExtensionId

    constructor(chromeExtensionId) {
        super();
        this.#chromeExtensionId = chromeExtensionId
    }

    /**
     * This method is only available in ChromeModeStorage
     * @return {Promise<*>} a promise containing the votesPageLimit value
     */
    getVotesPageLimit() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(this.#chromeExtensionId,
                {command: "get", key: "votesPageLimit"},
                function (found) {
                    console.log("Got this response from the extension:")
                    console.dir(found)
                    resolve(found.votesPageLimit)
                })
        })
    }

    saveVotes(votes) {
        let that = this
        let votesMapped = votes.map(vote => vote.toJSON())
        return new Promise(resolve => {
            chrome.runtime.sendMessage(this.#chromeExtensionId,
                {command: "save", data: {votes: votesMapped}},
                function (response) {
                    console.log("Got this response from the extension:")
                    console.dir(response)
                    resolve(that.#CHROME_STORAGE)
                })
        })
    }

    async getVotes() {
        let promise = new Promise(resolve => {
            chrome.runtime.sendMessage(this.#chromeExtensionId,
                {command: "get", key: "votes"},
                function (found) {
                    console.log("Got this response from the extension:")
                    console.dir(found)
                    resolve(found.votes)
                })
        })

        let votesData = await promise
        return votesData.map(voteData => Vote.deserialize(voteData))
    }

    savePosts(posts) {
        let that = this
        let postsMapped = posts.map(post => post.toJSON())
        return new Promise(resolve => {
            chrome.runtime.sendMessage(this.#chromeExtensionId,
                {command: "save", data: {posts: postsMapped}},
                function (response) {
                    console.log("Got this response from the extension:")
                    console.dir(response)
                    resolve(that.#CHROME_STORAGE)
                })
        })
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
            });
        })

        let postsData = await promise
        return postsData.map(postData => Post.deserialize(postData))
    }
}
