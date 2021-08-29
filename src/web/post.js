/**
 * A StackOverflow post
 */
class Post {

    /**
     * Deserialize from a data object to a concrete Post instance.
     * @param postData a regular object that includes the raw post data
     * @return {Post} a Post object. It's an instance of either Question or Answer.
     */
    static deserialize(postData) {
        let {type, id, htmlBody} = postData

        if (type === "question") {
            return new Question(id, postData.title, htmlBody)
        } else if (postData.type === "answer") {
            return new Answer(id, postData.questionId, htmlBody)
        } else {
            throw new Error(`Unrecognized post type '${type}'`)
        }
    }

    /**
     * @param id
     * @param htmlBody the rendered HTML of the post body
     */
    constructor(id, htmlBody) {
        this.id = id
        this.htmlBody = htmlBody
    }

    /**
     * Returns the type. Either "question" or "answer"
     */
    get type() {
        throw new Error("Must be implemented on sub-classes")
    }

    /**
     * This function is used by functions like "sort" to sort elements by their natural order.
     * @return {Number}
     */
    compare() {
        throw new Error("Must be implemented on sub-classes")
    }

    /**
     * Generate an HTML string for this post.
     * @return {string} HTML
     */
    toHtml() {
        throw new Error("Must be implemented on sub-classes")
    }

    toJSON() {
        return toJSON(this, "type")
    }
}

/**
 * A StackOverflow question post
 */
class Question extends Post {

    /**
     * @param id
     * @param title the title of the post. This is non-null for questions but is null for answers.
     * @param htmlBody the rendered HTML of the post body
     */
    constructor(id, title, htmlBody) {
        super(id, htmlBody);
        this.title = title
    }

    get type() {
        return "question";
    }

    compare() {
        return this.id
    }

    toHtml() {
        return `<div>
    <a class="question-answer-moniker" href="https://stackoverflow.com/q/${this.id}">Q</a>
</div>
<div>
    <h1 class="question-title">${this.title}</h1>
    ${this.htmlBody}
</div>`
    }
}

/**
 * A StackOverflow answer post
 */
class Answer extends Post {

    /**
     * @param id
     * @param questionId the ID of the answer's question post. The question post is considered the parent of the answer post.
     * @param htmlBody the rendered HTML of the post body
     */
    constructor(id, questionId, htmlBody) {
        super(id, htmlBody);
        this.questionId = questionId
    }

    get type() {
        return "answer"
    }

    compare() {
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
