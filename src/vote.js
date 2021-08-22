// Extract the question ID from the URL. The question ID is always after the "questions/" part in the URL.
// For example, 54189630 is the ID in the below URL:
// https://stackoverflow.com/questions/54189630/kill-all-gradle-daemons-regardless-version
function _extractQuestionId(url) {
    let match = /questions\/(?<id>\d+)/.exec(url)
    return parseInt(match.groups.id)
}

/**
 * * A StackOverflow vote on a post (either a question post or an answer post).
 */
class Vote {

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

    constructor(url) {
        let questionId = _extractQuestionId(url);
        super(questionId);
    }
}

/**
 * A StackOverflow vote on an answer.
 */
class AnswerVote extends Vote {

    constructor(url) {
        let questionId = _extractQuestionId(url);

        // Extract the answer ID from the URL. The answer ID is at the end of the URL.
        // For example, 28358529 is the ID in the below URL:
        // https://stackoverflow.com/questions/28351294/postgres-finding-max-value-in-an-int-array/28358529#28358529
        let match = /\d+$/.exec(url)
        let id = parseInt(match[0])

        super(id)

        this.questionId = questionId
    }
}
