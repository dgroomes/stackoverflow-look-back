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
 * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
 *
 * @param {Array<Number>} ids the list of post ID
 */
async function expand(ids) {
    console.log(`Querying for post information for posts with ids: ${ids}`)
    document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query

    let runQueryBtn = document.getElementById("submit-query");
    runQueryBtn.click() // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
    document.querySelector('input[name=PostIds]').value = `'${ids}'` // Set the parameter
    runQueryBtn.click() // Run the query
}

// This is the main function.
async function exec() {

    // Fetch the source code for the SQL query
    sql = await fetch(`${origin}/get-posts-by-ids.sql`)
        .then(response => response.text())

    console.log({sql})

    // Fetch the votes data from the local web server
    let votes = await fetch(`${origin}/example-votes.json`)
        .then(response => response.json())

    console.log({votes})

    // Before executing the SQL query, first register a MutationObserver to detect when the query results show up and
    // to handle the results.
    let queryResults = document.getElementById('resultSets');
    let observer = new MutationObserver(mutations => {
        console.log("SQL query results have arrived!")

        // Get all row elements in the results table. The SEDE uses a JS library called SlickGrid to render tables. All
        // rows have the class "slick-row".
        let rows = document.querySelectorAll('#resultSets .slick-row')

        // Look at the data...
        for (let row of rows) {
            // Extract each column of data
            let id = row.querySelector("div.l0").innerText
            let type = row.querySelector("div.l1").innerText
            let title = row.querySelector("div.l2").innerText
            let body = row.querySelector("div.l3").innerText
            console.log({
                id, type, title, body
            })
        }
    })
    observer.observe(queryResults, {subtree: true, childList: true})

    let ids = votes.map(vote => vote.postId)
    await expand(ids)
}

exec()
