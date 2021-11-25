import {toJSON} from "../../../util/to-json.ts"
import {QuestionPost} from "./QuestionPost.ts";
import {AnswerPost} from "./AnswerPost.ts";

export {Post}

/**
 * A StackOverflow post
 */
abstract class Post {

    id: number;
    htmlBody: string;

    /**
     * Deserialize from a data object to a concrete Post instance.
     * @param postData a regular object that includes the raw post data
     * @return {Post} a Post object. It's an instance of either Question or Answer.
     */
    static deserialize(postData : any) : Post {
        const {type, id, htmlBody} = postData

        if (type === "question") {
            return new QuestionPost(id, postData.tags, postData.title, htmlBody)
        } else if (postData.type === "answer") {
            return new AnswerPost(id, postData.questionId, htmlBody)
        } else {
            throw new Error(`Unrecognized post type '${type}'`)
        }
    }

    /**
     * @param {number} id
     * @param {string} htmlBody the rendered HTML of the post body
     */
    protected constructor(id : number, htmlBody: string) {
        this.id = id
        this.htmlBody = htmlBody
    }

    /**
     * Returns the type. Either "question" or "answer"
     */
    abstract get type() : string

    /**
     * Return the ID of the post's related question.
     */
    abstract get questionId() : number

    /**
     * This function is used by functions like "sort" to sort elements by their natural order.
     * @return {Number}
     */
    abstract naturalOrder() : number

    /**
     * Generate an HTML string for this post.
     * @return {string} HTML
     */
    abstract toHtml() : string

    toJSON() : object {
        return toJSON(this, "type", "questionId")
    }
}

