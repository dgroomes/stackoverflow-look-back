import {toJSON} from "../../util/to-json.ts"
export {Post, Question, Answer}

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
            return new Question(id, postData.tags, postData.title, htmlBody)
        } else if (postData.type === "answer") {
            return new Answer(id, postData.questionId, htmlBody)
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

/**
 * A StackOverflow question post
 */
class Question extends Post {

    tags: Array<String>
    title: String

    /**
     * @param {number} id
     * @param {Array<String>} tags the tags of the post. This is non-nullable. In StackExchange, it is nullable but here we will represent the absence of tags as an empty array.
     * @param {string} title the title of the post. This is non-null for questions but is null for answers.
     * @param {string} htmlBody the rendered HTML of the post body
     */
    constructor(id, tags, title, htmlBody) {
        super(id, htmlBody)
        this.tags = tags
        this.title = title
    }

    get type() {
        return "question"
    }

    get questionId() {
        return this.id
    }

    naturalOrder() {
        return this.id
    }

    toHtml() {
        return `<div>
    <a class="question-answer-moniker" href="https://stackoverflow.com/q/${this.id}">Q</a>
</div>
<div>
    <h1 class="question-title">${this.title}</h1>
    <div class="question-tags">${this.#tagsHtml()}</div>
    ${this.htmlBody}
</div>`
    }

    #tagsHtml() {
        let html = ''
        for (const tag of this.tags) {
            html += `<span>${tag}</span>`
        }
        return html
    }
}

/**
 * A StackOverflow answer post
 */
class Answer extends Post {

    readonly #questionId

    /**
     * @param {Number} id
     * @param {Number} questionId the ID of the answer's question post. The question post is considered the parent of the answer post.
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
