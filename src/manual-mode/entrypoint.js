// This is the entrypoint of the tool when the tool is run in the "Manual" mode. This file should not be used when the
// tool is run in the "Chrome extension" mode
//
// This file downloads the other JavaScript source files into the browser, then inspects the URL to figure out what to do:
// either scrape for the votes data or expand the posts data.

const origin = "http://127.0.0.1:8000"
const votesPageLimit = 1

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

const scripts = [
    "AppStorage.js",
    "manual-mode/ManualModeStorage.js",
    "Config.js",
    "VotesScraper.js",
    "expand-posts.js",
    "generate-html.js",
    "vote.js",
    "post.js",
    "util/download-to-file.js",
    "util/jquery-proxy.js",
    "util/to-json.js"
]

let scriptIncludes = scripts.map(urlPath => includeScript(`${origin}/${urlPath}`));

Promise.all(scriptIncludes)
    .then(() => Config.init())
    .then(() => {
        console.log("All scripts were included and the configuration was initialized.")

        let {origin, pathname, search} = window.location;
        let searchParams = new URLSearchParams(search)

        if (origin === "https://stackoverflow.com" && pathname.startsWith("/users/") && searchParams.get("tab") === "votes") {
            // The current page is the user profile page. We are in the context for scraping votes.
            votesScraper.scrapeVotes()
        } else if (origin === "https://data.stackexchange.com" && pathname.startsWith("/stackoverflow/query/new")) {
            // The current page is the Stack Exchange Data Explorer. We are in the context for expanding the posts data.
            expandPosts()
        } else if (pathname.startsWith("/generate-html.html")) {
            generateHtml()
        } else {
            console.error(`Unexpected page: ${window.location}`)
        }
    })
