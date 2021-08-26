/**
 * This is an interface class that defines the API for general storage and retrieval (i.e. reads/writes) of the domain
 * data.
 *
 * This interface must be implemented by concrete implementation classes for each of the "Chrome extension" and "Manual"
 * modes.
 */
class AppStorage {

    constructor() {
        if (this.constructor === AppStorage) {
            throw new Error("This should never be instantiated directly. Instantiate one of the extending classes.")
        }
    }

    /**
     * Save the votes data to storage
     *
     * @param {Array<Vote>} votes
     * @return {Promise<String>} a promise that resolves when the votes have been successfully saved. The promise's string value indicates which storage backend was used.
     */
    saveVotes(votes) {
    }

    /**
     * Read the votes data from storage.
     * @return {Array<Vote>}
     */
    async getVotes() {
    }

    /**
     * Saves posts data to storage
     * @param {Array<Post>}
     */
    savePosts(posts) {
    }

    /**
     * Get posts data from storage
     * @return {Array<Post>} posts
     */
    async getPosts() {
    }


    /**
     * Fetch the source code for the SQL query
     * @return {Promise<string>}
     */
    getSqlQuery() {
        return fetch(`${origin}/get-posts-by-ids.sql`)
            .then(response => response.text())
    }
}

