import {Vote} from "./Vote.ts";

/**
 * A StackOverflow vote on an answer.
 */
export class AnswerVote extends Vote {

    questionId: number

    constructor(id, questionId) {
        super(id)
        this.questionId = questionId
    }

    get type(): string {
        return "answer"
    }

    get ids(): Array<number> {
        return [this.id, this.questionId]
    }
}
