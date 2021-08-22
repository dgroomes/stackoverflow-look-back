/**
 * A StackOverflow vote on a post (either a question post or an answer post).
 */
class Vote {

    /**
     * Deserialize from a data object to a concrete Vote instance.
     * @param voteData a regular object that includes the raw vote data
     * @return {Vote} a Vote object. It's an instance of either QuestionVote or AnswerVote
     */
    static deserialize(voteData) {
        let {postType, url} = voteData

        // Extract the question ID from the URL. The question ID is always after the "questions/" part in the URL.
        // For example, 54189630 is the ID in the below URL:
        // https://stackoverflow.com/questions/54189630/kill-all-gradle-daemons-regardless-version
        let match = /questions\/(?<id>\d+)/.exec(url)
        let questionId = parseInt(match.groups.id)

        if (postType === "question") {
            return new QuestionVote(questionId)
        } else if (postType === "answer") {

            // Extract the answer ID from the URL. The answer ID is at the end of the URL.
            // For example, 28358529 is the ID in the below URL:
            // https://stackoverflow.com/questions/28351294/postgres-finding-max-value-in-an-int-array/28358529#28358529
            let match = /\d+$/.exec(url)
            let answerId = parseInt(match[0])
            return new AnswerVote(answerId, questionId)
        } else {
            throw new Error(`Unrecognized post type '${postType}'`)
        }
    }

    /**
     * @param {Number} id the ID of the post that was voted on
     */
    constructor(id) {
        this.id = id
    }
}

/**
 * A StackOverflow vote on a question.
 */
class QuestionVote extends Vote {

    constructor(id) {
        super(id);
    }
}

/**
 * A StackOverflow vote on an answer.
 */
class AnswerVote extends Vote {

    constructor(id, questionId) {
        super(id)
        this.questionId = questionId
    }
}
