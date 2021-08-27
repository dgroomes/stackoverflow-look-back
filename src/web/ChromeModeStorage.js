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
        return new Promise(resolve => {
            let votesMapped = votes.map(vote => vote.toJSON())
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
        let json = JSON.stringify(posts, null, 2)
        downloadToFile(json, "stackoverflow-posts.json")
    }

    async getPosts() {
        let postsData = await fetch(`${origin}/data/stackoverflow-posts.json`)
            .then(response => response.json())

        return postsData.map(postData => Post.deserialize(postData))
    }
}
