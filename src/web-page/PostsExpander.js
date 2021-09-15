// Given a collection of post IDs, expand the posts into the HTML body content and titles by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.

class PostsExpander {

    /**
     * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
     *
     * @param {Array<Number>} ids the list of post IDs
     */
    async expandByIds(ids) {
        console.debug({
            message: "Querying for post information for posts with IDs",
            id: ids
        })

        // Fetch the source code for the SQL query
        let sql = await fetch(`${webResourcesOrigin}/web-page/get-posts-by-ids.sql`)
            .then(response => response.text())

        document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query

        let runQueryBtn = document.getElementById("submit-query")
        runQueryBtn.click() // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
        document.querySelector('input[name=PostIds]').value = `'${ids}'` // Set the parameter
        runQueryBtn.click() // Run the query
    }

    /**
     * This is the main function.
     * @return {Promise<void>} a promise that resolves when the posts data is successfully expanded and saved to storage
     */
    async expandPosts() {

        let votes = await appStorage.getVotes()

        let promise = new Promise(resolve => {
            instrumentJQuery()
            registerAjaxSuccessSpy(async responseData => {

                // Take careful note. The web page will differ in the ways that it gets the result set. Sometimes,
                // it makes an initial POST request to kick off the SQL query on the back end. In this case,
                // there will be a later GET request to actually fetch the result set. In other cases, there
                // will be a POST request for a "saved query" and the response will include the result set.
                // I'm not sure how exactly this works but I think the Stack Exchange Data Explorer is doing
                // some caching on queries that it recognizes. In any case, check for the field "resultSets"
                // to see if the response has the data or not.
                let resultSets = responseData.resultSets
                if (resultSets) {
                    // Get the first element in the result sets array. When would this ever be more than one?
                    let {rows} = resultSets[0]

                    // Collect the post data from the rows
                    let posts = rows.map(([id, parentId, type, title, body]) => {
                        if (type === 1) {
                            return new Question(id, title, body)
                        } else {
                            return new Answer(id, parentId, body)
                        }
                    })

                    await appStorage.savePosts(posts)
                    resolve()
                }
            })
        })

        // Create a set of all the answer and question posts IDs. Use a Set data structure to avoid duplicates. When an
        // answer and its question are both up-voted (this is the common case), then we have two references to the question
        // ID. So, use a Set to avoid duplicates.
        let idsUnique = new Set(votes.flatMap(vote => vote.ids))
        let idsSorted = Array.from(idsUnique).sort() // Sorting the IDs is not needed, but helps for reproduce-ability and debugging.
        await this.expandByIds(idsSorted)
        console.info(`The posts data has been successfully expanded for ${idsSorted.length} posts and saved to storage!`)
        await promise
    }
}
