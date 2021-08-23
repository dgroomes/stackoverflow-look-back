// This is a general abstraction over the persistence layer for the domain data that this tool saves/reads.
// For now, we just read the domain data as JSON via HTTP GET requests from a local web server and write data by downloading
// it into files using the "Data URLs" browser feature. But in the future, it's possible that this tool runs as a browser
// extension in which case the underlying storage engine will be something like IndexedDB.

/**
 * Save votes to the persistence layer.
 *
 * This downloads the votes data as a JSON file.
 *
 * @param {Array<Vote>} votes
 */
function saveVotes(votes) {
    let votesJson = JSON.stringify(votes, null, 2)
    downloadToFile(votesJson, "stackoverflow-votes.json")
}

/**
 * Get votes from the persistence layer.
 *
 * This fetches the votes data from the local web server and deserializes to Vote instances.
 *
 * @return {Array<Vote>}
 */
async function getVotes() {
    let votesData = await fetch(`${origin}/data/stackoverflow-votes.json`)
        .then(response => response.json())

    return votesData.map(voteData => Vote.deserialize(voteData))
}

/**
 * Saves posts to the persistence layer
 */
function savePosts(posts) {
    let json = JSON.stringify(posts, null, 2)
    downloadToFile(json, "stackoverflow-posts.json")
}

/**
 * Get posts from the persistence layer
 *
 * This fetches the posts data (questions and answers) from the local web server and deserializes to Post instances.
 *
 * @return {Array<Post>} posts
 */
async function getPosts() {
    let postsData = await fetch(`${origin}/data/stackoverflow-posts.json`)
        .then(response => response.json())

    return postsData.map(postData => Post.deserialize(postData))
}
