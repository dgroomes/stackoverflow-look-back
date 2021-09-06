/**
 * This is the implementation of the Storage interface for the "Manual" mode.
 *
 * Domain data will be read by fetching it via HTTP GET requests from the local web server.
 * Domain data will be written by saving it to files using the "Data URLs" browser feature.
 */
class ManualModeStorage extends AppStorage {

    #FILE_DOWNLOAD = "File download"

    /**
     * This downloads the votes data as a JSON file.
     */
    saveVotes(votes) {
        let votesJson = JSON.stringify(votes, null, 2)
        downloadToFile(votesJson, "stackoverflow-votes.json")
        return Promise.resolve(this.#FILE_DOWNLOAD)
    }

    async getVotes() {
        let promise = fetch(`${origin}/data/stackoverflow-votes.json`)
            .then(response => response.json())

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
