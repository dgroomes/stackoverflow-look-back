// Given a collection of post IDs, expand the posts into the HTML body content and titles by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.

/**
 * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
 *
 * @param {Array<Number>} ids the list of post IDs
 */
async function expandByIds(ids) {
    console.log({
        message: "Querying for post information for posts with IDs",
        id: ids
    })

    // Fetch the source code for the SQL query
    let sql = await fetch(`${origin}/get-posts-by-ids.sql`)
        .then(response => response.text())

    document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query

    let runQueryBtn = document.getElementById("submit-query");
    runQueryBtn.click() // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
    document.querySelector('input[name=PostIds]').value = `'${ids}'` // Set the parameter
    runQueryBtn.click() // Run the query
}

/**
 * Fetch the votes data from the local web server
 * @return {Array<Vote>}
 */
async function fetchVotes() {
    // Fetch the votes data from the local web server
    let votesData = await fetch(`${origin}/stackoverflow-votes.json`)
        .then(response => response.json())

    return votesData.map(voteData => Vote.deserialize(voteData))
}

/**
 * Take the result set JSON data, transform it, and save it to a file.
 */
function downloadPostsDateToFile(resultSets) {
    // Get the first element in the result sets array. When would this ever be more than one?
    let {rows} = resultSets[0]

    // Collect the post data
    let posts = rows.map(([id, parentId, type, title, body]) => {
        if (type === 1) {
            return new Question(id, title, body)
        } else {
            return new Answer(id, parentId, body)
        }
    })

    let json = JSON.stringify(posts, null, 2)


    // Download the posts data as a JSON file.
    downloadToFile(json, "stackoverflow-posts.json")
}

// This is the main function.
async function expandPosts() {

    let votes = await fetchVotes()

    instrumentJQuery()
    registerAjaxSuccessSpy(responseData => {

        // Take careful note. The web page will differ in the ways that it gets the result set. Sometimes,
        // it makes an initial POST request to kick off the SQL query on the back end. In this case,
        // there will be a later GET request to actually fetch the result set. In other cases, there
        // will be a POST request for a "saved query" and the response will include the result set.
        // I'm not sure how exactly this works but I think the Stack Exchange Data Explorer is doing
        // some caching on queries that it recognizes. In any case, check for the field "resultSets"
        // to see if the response has the data or not.
        let resultSets = responseData.resultSets
        if (resultSets) {
            downloadPostsDateToFile(resultSets)
        }
    })

    // Create a set of all the answer and question posts IDs. Use a Set data structure to avoid duplicates. When an
    // answer and its question are both up-voted (this is the common case), then we have two references to the question
    // ID. So, use a Set to avoid duplicates.
    let ids = new Set()
    for (let vote of votes) {
        ids.add(vote.id)
        if (vote instanceof AnswerVote) {
            ids.add(vote.questionId)
        }
    }
    let idsClean = Array.from(ids).sort() // Sorting the IDs is not needed, but helps for reproduce-ability and debugging.
    await expandByIds(idsClean)
}
