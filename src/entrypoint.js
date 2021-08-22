// This is the entrypoint of the tool.
// This file downloads the other JavaScript source files into the browser, then inspects the URL to figure out what to do:
// either scrape for the votes data or expand the posts data.

const origin = "http://127.0.0.1:8000"

/**
 * Include a script dependency.
 *
 * This creates a <script> element with the given URL and adds it to the document head. The script will be downloaded and
 * run. This is a way to dynamically load JavaScript to the page.
 * @param url
 * @return {Promise} a promise that resolves when the script loads
 */
function includeScript(url) {
    let el = document.createElement("script")
    el.src = url
    document.head.append(el)

    let pointer
    let promise = new Promise((res, rej) => pointer = {res, rej})

    el.onload = pointer.res

    return promise
}

Promise.all([
    includeScript(`${origin}/scrape-votes.js`),
    includeScript(`${origin}/expand-posts.js`)])
    .then(results => {
        let resultsPrintable = JSON.stringify(results, null, 2);
        console.log(`All dynamically added JavaScript source files have been loaded: ${resultsPrintable}`)

        let {origin, pathname, search} = window.location;
        let searchParams = new URLSearchParams(search)

        if (origin === "https://stackoverflow.com" && pathname.startsWith("/users/") && searchParams.get("tab") === "votes") {
            // The current page is the user profile page. We are in the context for scraping votes.
            scrapeVotes()
        } else if (origin === "https://data.stackexchange.com" && pathname.startsWith("/stackoverflow/query/new")) {
            // The current page is the Stack Exchange Data Explorer. We are in the context for expanding the posts data.
            expandPosts()
        } else {
            console.error(`Unexpected page: ${window.location}`)
        }
    })
