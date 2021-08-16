// Given a collection of post IDs, expand the posts into the HTML body content and creation dates by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.
//
// NOT YET FULLY IMPLEMENTED

let origin = "http://127.0.0.1:8000"

/**
 * A StackOverflow post
 */
class Post {

    /**
     * @param id
     * @param type the type of post. Either "question" or "answer"
     * @param htmlBody the rendered HTML of the post body
     */
    constructor(id, type, htmlBody) {
        this.id = id
        this.type = type
        this.htmlBody = htmlBody
    }
}

let sql

/**
 * Expand a post ID into a post object by querying from the Stack Exchange Data Explorer
 *
 * @param id the post ID
 * @return {Promise<Post>} the fully expanded Stack Overflow post data
 */
async function expand(id) {
    // todo execute a SEDE SQL query!
    console.log(`Query for post information for ID=${id}`)
    document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query
    document.querySelector('input[name=PostId]').value = id // Set the parameter
    document.getElementById("submit-query").click() // Execute the query
}

// This is the main function.
async function exec() {

    // Fetch the source code for the SQL query
    sql = await fetch(`${origin}/get-post-by-id.sql`)
        .then(response => response.text())

    console.log({sql})

    // Fetch the votes data from the local web server
    let votes = await fetch(`${origin}/example-votes.json`)
        .then(response => response.json())

    console.log({votes})

    for (let vote of votes) {
        await expand(vote.postId)
    }
}

exec()
