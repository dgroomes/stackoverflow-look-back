import {QuestionVote} from "./QuestionVote";
import {AnswerVote} from "./AnswerVote";
import {Vote} from "./Vote";

/**
 * Deserialize from a data object to a concrete Vote instance.
 * @param voteData a regular object that includes the raw vote data
 * @return a Vote object. It's an instance of either QuestionVote or AnswerVote
 */
export function deserialize(voteData) : Vote {
    const {id, type} = voteData
    if (type === "question") {
        return new QuestionVote(id)
    } else if (type === "answer") {
        return new AnswerVote(id, voteData.questionId)
    } else {
        throw new Error(`Unrecognized post type '${type}'`)
    }
}

/**
 * Parse a post URL and instantiate a Vote instance from it
 * @param postUrl the URL of the post
 * @param postType either "question" or "answer"
 * @return {Vote} a Vote object. It's an instance of either QuestionVote or AnswerVote
 */
export function parseFromUrl(postUrl, postType) {
    // Extract the question ID from the URL. The question ID is always after the "questions/" part in the URL.
    // For example, 54189630 is the ID in the below URL:
    // https://stackoverflow.com/questions/54189630/kill-all-gradle-daemons-regardless-version
    const match: RegExpExecArray = /questions\/(?<id>\d+)/.exec(postUrl)!

    // noinspection TypeScriptUnresolvedVariable
    let groups = (match as any).groups // For some reason, the "RegExpExecArray" type doesn't define the "groups" field.

    const questionId = parseInt(groups.id)

    if (postType === "question") {
        return new QuestionVote(questionId)
    } else if (postType === "answer") {

        // Extract the answer ID from the URL. The answer ID is at the end of the URL.
        // For example, 28358529 is the ID in the below URL:
        // https://stackoverflow.com/questions/28351294/postgres-finding-max-value-in-an-int-array/28358529#28358529
        const match = /\d+$/.exec(postUrl)!
        const answerId = parseInt(match[0])
        return new AnswerVote(answerId, questionId)
    } else {
        throw new Error(`Unrecognized post type '${postType}'`)
    }
}
