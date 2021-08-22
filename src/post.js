/**
 * A StackOverflow post
 */
export class Post {

    /**
     * @param id
     * @param parentId the ID of the parent post. This is nullable. Answer posts have parents but questions do not.
     * @param type the type of post. Either "question" or "answer"
     * @param title the title of the post. This is non-null for questions but is null for answers.
     * @param htmlBody the rendered HTML of the post body
     */
    constructor(id, parentId, type, title, htmlBody) {
        this.id = id
        this.parentId = parentId
        this.type = type
        this.title = title
        this.htmlBody = htmlBody
    }
}
