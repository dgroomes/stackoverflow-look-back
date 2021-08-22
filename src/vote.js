/**
 * This is a data class that represents a StackOverflow vote.
 */
class Vote {

    /**
     * @param postType the type of post that the vote was for. Either "question" or "answer"
     * @param postUrl the URL of the post
     * @param {Number} postId the ID of the post
     * @param {Number} parentPostId the ID of the parent post. When the post is an answer, then its parent post is a question. A question does not have a parent and this field will be null.
     */
    constructor(postType, postUrl, postId, parentPostId) {
        this.postType = postType
        this.postUrl = postUrl
        this.postId = postId
        this.parentPostId = parentPostId
    }
}
