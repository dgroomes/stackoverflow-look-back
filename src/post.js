/**
 * A StackOverflow post
 */
class Post {

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
    get type() { throw new Error("Must be implemented on sub-classes") }

    /**
     * Define the toJSON function so that JSON.stringify picks up the "key" field and all the normal fields.
     * Read more about toJSON at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
     */
    toJSON() {
        let obj = {
            type: this.type
        }

        for (let name of Object.getOwnPropertyNames(this)) {
            obj[name] = this[name]
        }

        return obj
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
}
