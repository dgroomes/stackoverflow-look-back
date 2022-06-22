import {QuestionPost} from "./QuestionPost";
import {AnswerPost} from "./AnswerPost";
import {Post} from "./Post";

/**
 * Deserialize from a data object to a concrete Post instance.
 * @param postData a regular object that includes the raw post data
 * @return {Post} a Post object. It's an instance of either Question or Answer.
 */
export function deserialize(postData : any) : Post {
    const {type, id, htmlBody} = postData

    if (type === "question") {
        return new QuestionPost(id, postData.tags, postData.title, htmlBody)
    } else if (postData.type === "answer") {
        return new AnswerPost(id, postData.questionId, htmlBody)
    } else {
        throw new Error(`Unrecognized post type '${type}'`)
    }
}
