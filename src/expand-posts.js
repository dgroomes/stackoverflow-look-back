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

                    // Proxy the "success" callback so that we can intercept the result set of successful queries to the Stack Exchange Data Explorer
                    settings.success = new Proxy(success, {
                        apply(target, thisArg, argumentsList) {
                            console.log("The 'success' callback was invoked on this ajax request.")

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


                            downloadPostsData()

                            // Finally, delegate to the underlying "original/normal/actual" function.
                            Reflect.apply(...arguments)
                        }
                    })

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
    let votes = await fetch(`${origin}/stackoverflow-votes.json`)
        .then(response => response.json())

    console.log({votes})

    instrumentJQuery()

    let ids = votes.map(vote => vote.postId)
    await expand(ids)
}

/**
 * Download the posts data as a JSON file.
 *
 * This uses a feature called Data URLs (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
 */
function downloadPostsData() {
    let json = JSON.stringify(posts, null, 2)
    let encoded = encodeURIComponent(json)

    let el = document.createElement('a')
    el.setAttribute('href', `data:application/json,${encoded}`)
    el.setAttribute('download', "stackoverflow-posts.json")
    el.click()
}

exec()
