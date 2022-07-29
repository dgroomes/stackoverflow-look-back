import {toJSON} from "../../../util/to-json"

export {Post}

/**
 * A StackOverflow post
 */
abstract class Post {

    id: number;
    htmlBody: string;

    /**
     * @param id The ID of the post
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

    toJSON() : object {
        return toJSON(this, "type", "questionId")
    }
}

