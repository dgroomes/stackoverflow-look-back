"use strict"

// Given a collection of post IDs, expand the posts into the HTML body content and titles by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.

class PostExpander {

    /**
     * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
     *
     * @param {Array<Number>} ids the list of post IDs
     */
    async expandByIds(ids) {
        console.log({
            message: "Querying for post information for posts with IDs",
            id: ids
        })

        // Fetch the source code for the SQL query
        let sql = await appStorage.getSqlQuery()

        document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query

        let runQueryBtn = document.getElementById("submit-query");
        runQueryBtn.click() // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
        document.querySelector('input[name=PostIds]').value = `'${ids}'` // Set the parameter
        runQueryBtn.click() // Run the query
    }

    /**
     * This is the main function.
     * @return {Promise<void>}
     */
    async expandPosts() {
        let votes = await appStorage.getVotes()

        // This is awkward, but only in the "Manual" mode do we want to register the handler. When in "Chrome extension"
        // mode we need to register the handler from the Chrome extension JavaScript execution context because only that
        // context has access to the "chrome.webRequest" API. The design of this tool has gotten really complicated since
        // I've added the Chrome extension mode and since trying to applying object-oriented design and ES6 classes. The
        // object model is now split haphazardly across the "Content Scripts" execution environment and the Chrome
        // extension execution environment.
        if (mode === "manual-mode") {
            this.registerHandler()
        }
        // Create a set of all the answer and question posts IDs. Use a Set data structure to avoid duplicates. When an
        // answer and its question are both up-voted (this is the common case), then we have two references to the question
        // ID. So, use a Set to avoid duplicates.
        let idsUnique = new Set(votes.flatMap(vote => vote.ids))
        let idsSorted = Array.from(idsUnique).sort() // Sorting the IDs is not needed, but helps for reproduce-ability and debugging.
        await this.expandByIds(idsSorted)
    }

    registerHandler() {
        class ExpandPostsHandler extends RequestInterceptorHandler {

            shouldHandle(data) {
                // Take careful note. The web page will differ in the ways that it gets the result set. Sometimes,
                // it makes an initial POST request to kick off the SQL query on the back end. In this case,
                // there will be a later GET request to actually fetch the result set. In other cases, there
                // will be a POST request for a "saved query" and the response will include the result set.
                // I'm not sure how exactly this works but I think the Stack Exchange Data Explorer is doing
                // some caching on queries that it recognizes. In any case, check for the field "resultSets"
                // to see if the response has the data or not.
                return Boolean(responseData.resultSets)
            }

            handle(response) {
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

                appStorage.savePosts(posts)
            }
        }

        requestInterceptorInstrumenter.register(new ExpandPostsHandler())
    }
}
