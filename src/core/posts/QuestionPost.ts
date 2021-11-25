import {Post} from "./Post.ts";

/**
 * A StackOverflow question post
 */
class QuestionPost extends Post {

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

export {QuestionPost};
