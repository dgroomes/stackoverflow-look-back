import {toJSON} from "../../../util/to-json"

export {Vote}

/**
 * A StackOverflow vote on a post (either a question post or an answer post).
 */
abstract class Vote {

    id: number

    /**
     * @param id the ID of the post that was voted on
     */
    protected constructor(id: number) {
        this.id = id
    }

    /**
     * Returns the type. Either "question" or "answer"
     */
    abstract get type() : string

    /**
     * @return the IDs related to this post
     */
    abstract get ids() : Array<number>

    toJSON() : object {
        return toJSON(this, "type")
    }
}

