/**
 * An implementation of the AppStorage interface for the "Chrome extension" mode.
 *
 * It will read and write domain data from. the Chrome extension. Refer to the docs: https://developer.chrome.com/docs/extensions/reference/storage/
 */
class ChromeModeStorage extends AppStorage {

    #CHROME_STORAGE = "Chrome storage"

    saveVotes(votes) {
        return new Promise(resolve => {
            let votesMapped = votes.map(vote => vote.toJSON())
            chrome.storage.sync.set({votes: votesMapped}, () => {
                resolve(this.#CHROME_STORAGE)
            })
        })
    }

    async getVotes() {
        let promise = new Promise((resolve) => {
            chrome.storage.sync.get("votes", (data) => {
                resolve(data.votes)
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

    /**
     * Fetch the source code for the SQL query
     * @return {Promise<string>}
     */
    getSqlQuery() {
        let url = chrome.runtime.getURL('/src/get-posts-by-ids.sql')
        return fetch(url).then(response => response.text())
    }
}
