// Given a collection of post IDs, expand the posts into the HTML body content and creation dates by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.

let sql
let posts = []

/**
 * Instrument the jQuery object with our own custom interception code for the "ajax" function.
 * To instrument jQuery we use a Proxy object. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy.
 *
 * Note: I think this is mostly overkill. I could get the same effect without the Proxy object and instead just redefine
 * the "ajax" method with a function that does the same thing. Proxy is awesome but might be overkill here. It and
 * Reflect are a pretty good API.
 */
function instrumentJQuery() {

    let handler = {
        get: function (target, prop, receiver) {
            console.log(`Property '${prop}' was accessed on the jQuery object ($)`)
            let resolvedProp = Reflect.get(...arguments) // Get the "actual" property on the underlying proxied object.

            if (prop === "ajax") {
                console.log(`Instrumenting a pointcut/aspect around 'ajax'`)

                return function instrumented() {
                    console.log("'ajax' was invoked with: ")
                    console.log({...arguments})

                    // The 'ajax' function may take a variable amount of arguments. See the jQuery docs for the complete details: https://api.jquery.com/jquery.ajax/
                    // But for our sake, we only expect it to be called with exactly one argument, the "settings" object.
                    // Throw an error if the arguments do not meet our expectations.
                    let argLength = arguments.length;
                    if (argLength !== 1) {
                        throw new Error(`Length of arguments of size '${argLength}' for the 'ajax' function was not expected.`)
                    }
                    let arg0 = arguments[0];
                    let arg0Type = typeof arg0;
                    if (arg0Type !== "object") { // Technically this is not a perfect assertion. But it's good enough. We mostly want to assert that the argument is not a string but is instead an object. (Strings aren't objects in JavaScript.)
                        throw new Error(`Expected a string but found type '${arg0Type}' for argument '${arg0}' to the 'ajax' function`)
                    }

                    let settings = arg0 // arg0 is the "settings" object that the "ajax" function takes. See https://api.jquery.com/jquery.ajax/
                    let {success} = settings
                    if (!success) {
                        throw new Error("There was no 'success' callback defined in the settings for the ajax request. This is unexpected.")
                    }

                    // We only want to register a proxy over GET HTTP requests to the endpoint starting with the URL "/query/job".
                    // The response for this request is the SQL query result set.
                    //
                    // By contrast, the page also makes a POST request which starts the SQL query on the server side. We
                    // don't need to track this request.
                    if (settings.type === "GET" && settings.url.includes("/query/job")) {
                        // Proxy the "success" callback so that we can intercept the result set of successful queries to the Stack Exchange Data Explorer
                        settings.success = new Proxy(success, {
                            apply(target, thisArg, argumentsList) {
                                let responseData = argumentsList[0];

                                // Get the first element in the result sets array. When would this ever be more than one?
                                let {rows} = responseData.resultSets[0]

                                // Collect the post data
                                rows.map(([id, parentId, type, title, body]) => {
                                    if (type === 1) {
                                        type = "question"
                                    } else {
                                        type = "answer"
                                    }
                                    return new Post(id, parentId, type, title, body)
                                })
                                    .forEach(post => posts.push(post))


                                let json = JSON.stringify(posts, null, 2)


                                // Download the posts data as a JSON file.
                                downloadToFile(json, "stackoverflow-posts.json")

                                // Finally, delegate to the underlying "original/normal/actual" function.
                                Reflect.apply(...arguments)
                            }
                        })
                    }

                    return resolvedProp.bind(receiver)(...arguments) // Invoke the "actual" property
                }
            }
            return resolvedProp
        }
    }
    let proxy = new Proxy(window.$, handler);
    window.$ = proxy
    window.jQuery = proxy
}

/**
 * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
 *
 * @param {Array<Number>} ids the list of post IDs
 */
async function expand(ids) {
    console.log({
        message: "Querying for post information for posts with IDs",
        id: ids
    })
    document.querySelector('.CodeMirror').CodeMirror.setValue(sql) // Set the SQL query

    let runQueryBtn = document.getElementById("submit-query");
    runQueryBtn.click() // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
    document.querySelector('input[name=PostIds]').value = `'${ids}'` // Set the parameter
    runQueryBtn.click() // Run the query
}

// This is the main function.
async function expandPosts() {

    // Fetch the source code for the SQL query
    sql = await fetch(`${origin}/get-posts-by-ids.sql`)
        .then(response => response.text())

    // Fetch the votes data from the local web server
    let votes = await fetch(`${origin}/stackoverflow-votes.json`)
        .then(response => response.json())

    instrumentJQuery()

    // Create a set of all the answer and question posts IDs. Use a Set data structure to avoid duplicates. When an
    // answer and its question are both up-voted (this is the common case), then we have two references to the question
    // ID. So, use a Set to avoid duplicates.
    let ids = new Set()
    for (let vote of votes) {
        ids.add(vote.postId)
        if (vote.postType === "answer") {
            ids.add(vote.parentPostId)
        }
    }
    let idsClean = Array.from(ids).sort() // Sorting the IDs is not needed, but helps for reproduce-ability and debugging.
    await expand(idsClean)
}
