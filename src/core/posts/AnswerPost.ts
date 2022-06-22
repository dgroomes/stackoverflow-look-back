import {Post} from "./Post";

/**
 * A StackOverflow answer post
 */
class AnswerPost extends Post {

    readonly #questionId

    /**
     * @param id The ID of the post
     * @param questionId the ID of the answer's question post. The question post is considered the parent of the answer post.
     * @param {String} htmlBody the rendered HTML of the post body
     */
    constructor(id, questionId, htmlBody) {
        super(id, htmlBody)
        this.#questionId = questionId
    }

    get type() {
        return "answer"
    }

    get questionId() {
        return this.#questionId
    }

    naturalOrder() {
        return Number(`${this.questionId}.${this.id}`) // Answers should always appear after questions. We can use a Dewey Decimal sorting implementation. QuestionId.AnswerId. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    }

    toHtml() {
        return `<div>
    <a class="question-answer-moniker" href="https://stackoverflow.com/a/${this.id}">A</a>
</div>
<div>
    ${this.htmlBody}
</div>`
    }
}

export {AnswerPost};
