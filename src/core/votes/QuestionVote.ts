import {Vote} from "./Vote.ts";

/**
 * A StackOverflow vote on a question.
 */
export class QuestionVote extends Vote {

    constructor(id) {
        super(id)
    }

    get type(): string {
        return "question"
    }

    get ids(): Array<number> {
        return [this.id]
    }
}
