// This is the entrypoint of the tool that runs in the DOM. It accommodates both the "Manual" and "Chrome extension" modes.
//
// This file downloads the other JavaScript source files into the browser, wires up all objects and configuration, then
// inspects the URL to figure out what to do: either scrape for the votes data or expand the posts data.

const manualModeWebServerOrigin = "http://127.0.0.1:8000"
let mode
let extensionContext // Is the web page served directly by the extension? I.e. is the web page at a URL starting with "chrome-extension://"
let webResourcesOrigin
let chromeExtensionId

/**
 * Detect the mode: either "manual" or "chrome-extension".
 *
 * Also, based on the mode, configure the origin that serves the web resources like the JavaScript files. This origin will
 * either by a special Chrome extension URL or the local web server.
 */
function detectMode() {

    /**
     * Identify the Chrome extension ID from a Chrome extension URL
     * @param url. For example: chrome-extension://akidegfimbjmokpejlcnjagogamdiinl/web/generate-html.html
     */
    function identifyChromeId(url) {
        let regex = new RegExp("chrome-extension://([a-z]+)")
        mode = "chrome-extension"
        let matches = url.match(regex)
        webResourcesOrigin = matches[0]
        chromeExtensionId = matches[1]
    }

    // The "generate-html.html" page itself is served by the Chrome extension and so the URL protocol will be
    // "chrome-extension://"
    if (window.origin.startsWith("chrome-extension://")) {
        extensionContext = true
        identifyChromeId(window.origin)
        return
    }

    extensionContext = false

    let script = document.getElementById("dom-entrypoint")
    if (script === null) {
        mode = "manual"
        webResourcesOrigin = manualModeWebServerOrigin
    } else {
        identifyChromeId(script.src)
    }
}

/**
 * @return {Promise[]}
 */
function downloadScripts() {
    const scripts = [
        "AppStorage.js",
        "ManualModeStorage.js",
        "ChromeModeStorage.js",
        "VotesScraper.js",
        "PostExpander.js",
        "HtmlGenerator.js",
        "vote.js",
        "post.js",
        "util/download-to-file.js",
        "util/jquery-proxy.js",
        "util/to-json.js"
    ]

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

    return scripts.map(urlPath => includeScript(`${webResourcesOrigin}/web/${urlPath}`));
}

async function configureState() {

    /**
     * This just exists to help intellisense in the IDE
     * @param {AppStorage} appStorage
     */
    function assignPolymorphicGlobals(appStorage) {
        window.appStorage = appStorage
    }

    let appStorage
    if (mode === "chrome-extension") {
        appStorage = new ChromeModeStorage(chromeExtensionId)
        if (!extensionContext) { // This is hacky. But when executing in an extension context, this call will fail because there is no listener.
            window.votesPageLimit = await appStorage.getVotesPageLimit()
        }
    } else {
        appStorage = new ManualModeStorage()
        window.votesPageLimit = 1
    }

    window.votesScraper = new VotesScraper()
    window.postExpander = new PostExpander()
    window.htmlGenerator = new HtmlGenerator()

    assignPolymorphicGlobals(appStorage)
}

function detectAndExecuteFunction() {
    let {origin, pathname, search} = window.location;
    let searchParams = new URLSearchParams(search)

    if (origin === "https://stackoverflow.com" && pathname.startsWith("/users/") && searchParams.get("tab") === "votes") {
        // The current page is the user profile page. We are in the context for scraping votes.
        votesScraper.scrapeVotes()
    } else if (origin === "https://data.stackexchange.com" && pathname.startsWith("/stackoverflow/query/new")) {
        // The current page is the Stack Exchange Data Explorer. We are in the context for expanding the posts data.
        postExpander.expandPosts().then(() => {
            console.log("Posts were expanded successfully")
            if (mode === "chrome-extension") {
                console.log("Because the tool is running 'chrome-extension' mode, the HTML generation step can be automatically run. Opening a new tab to the 'generate-html.html' page...")
                chrome.runtime.sendMessage(chromeExtensionId,
                    {command: "open-generate-html-page"},
                    function (response) {
                        console.log("Got this response from the extension:")
                        console.dir(response)
                    })
            }
        })
    } else if (pathname.includes("/generate-html.html")) {
        htmlGenerator.generateHtml().then(() => console.log("HTML was generated successfully"))
    } else {
        console.error(`Unexpected page: ${window.location}`)
    }
}

detectMode()

Promise.all(downloadScripts())
    .then(async () => {
        console.log("All scripts were included.")
        await configureState()
        detectAndExecuteFunction()
    })
