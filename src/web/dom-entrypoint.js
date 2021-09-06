// This is the entrypoint of the tool that runs in the DOM.
//
// This file downloads the other JavaScript source files into the browser, wires up all objects and configuration, then
// inspects the URL to figure out what to do: either scrape for the votes data or expand the posts data.

console.log("[dom-entrypoint.js] Initializing...")

let browserName // Either "chrome" or "firefox. Firefox and Chrome web extension APIs have differences and we need to know the browser.
let extensionContext // Is the web page served directly by the extension? I.e. is the web page at a URL starting with "chrome-extension://"
let webResourcesOrigin // The origin that serves the web resources like the JavaScript files. This origin will be a special Chrome/Firefox extension URL.
let webExtensionId // This is the ID of the web extension. This is always a super long ID that's generated the browser.

/**
 * Detect the current environment and assign the following global properties:
 *   - browserName
 *   - extensionContext
 *   - webResourcesOrigin
 *   - webExtensionId
 */
function detectEnvironment() {

    /**
     * Detect information based on the extension URL.
     *
     * From the examples below, notice how the legal characters include lowercase letters, numbers and the hyphen
     * character.
     *
     * @param url. For example:
     *               - chrome-extension://akidegfimbjmokpejlcnjagogamdiinl/web/generate-html.html
     *               - moz-extension://df0b610b-995b-9240-8c3b-fcaf155c9005/web/dom-entrypoint.js
     */
    function detectFromExtensionUrl(url) {
        let regex = new RegExp("(chrome-extension|moz-extension)://([a-z0-9-]+)")
        let matches = regex.exec(url)
        webResourcesOrigin = matches[0]

        let host = matches[1]
        if (host === "chrome-extension")
            browserName = "chrome"
        else if (host === "moz-extension") {
            browserName = "firefox"
        } else {
            throw new Error(`Unrecognized host name: '${host}', Expected either 'chrome-extension' or 'moz-extension'`)
        }

        webExtensionId = matches[2]
    }

    // The "generate-html.html" page itself is served by the web extension and so the URL protocol will be
    // "chrome-extension://" or "moz-extension://"
    if (window.origin.startsWith("chrome-extension://") || window.origin.startsWith("moz-extension://")) {
        extensionContext = true
        detectFromExtensionUrl(window.origin)
        return
    }

    extensionContext = false

    let script = document.getElementById("dom-entrypoint")
    detectFromExtensionUrl(script.src)
}

/**
 * Load all scripts
 * @return {Promise} a promise that resolves when all scripts have loaded into the page. Specifically, all script
 * elements will have called their 'onload' functions.
 */
function downloadScripts() {
    const noDepsScripts = [
        "RpcClient.js",
        "AppStorage.js",
        "VotesScraper.js",
        "PostExpander.js",
        "HtmlGenerator.js",
        "vote.js",
        "post.js",
        "util/download-to-file.js",
        "util/jquery-proxy.js",
        "util/to-json.js"
    ]

    // These files depend on another file already having been loaded because they use the "extends" keyword at the
    // top-level. If I used the module system would this not be a problem?
    const oneDepsScripts = [
        "ChromeRpcClient.js",
        "FirefoxRpcClient.js"
    ]

    /**
     * Include a script dependency.
     *
     * This creates a <script> element with the given URL and adds it to the document head. The script will be downloaded and
     * run. This is a way to dynamically load JavaScript to the page.
     * @param fileName
     * @return {Promise} a promise that resolves when the script loads
     */
    function includeScript(fileName) {
        let el = document.createElement("script")
        el.src = `${webResourcesOrigin}/web/${fileName}`
        document.head.append(el)

        return new Promise((res, rej) => {
            el.onload = function () {
                res()
            }
        })
    }

    return Promise.all(noDepsScripts.map(fileName => includeScript(fileName)))
        .then(_ => Promise.all(oneDepsScripts.map(fileName => includeScript(fileName))))
}

async function configureState() {

    /**
     * This just exists to help intellisense in the IDE
     * @param {RpcClient} rpcClient
     */
    function assignPolymorphicGlobals(rpcClient) {
        window.rpcClient = rpcClient
    }

    let rpcClient

    if (browserName === "chrome") {
        rpcClient = new ChromeRpcClient(webExtensionId)
    } else if (browserName === "firefox") {
        rpcClient = new FirefoxRpcClient(webExtensionId)
    } else {
        throw new Error(`Unexpected browser: ${browserName}. Expected either 'chrome' or 'firefox'`)
    }

    window.appStorage = new AppStorage(rpcClient, browserName)

    if (!extensionContext) { // This is hacky. But when executing in an extension context, this call will fail because there is no listener.
        console.log(`[dom-entrypoint.js] Fetching the votesPageLimit`)
        window.votesPageLimit = await appStorage.getVotesPageLimit()
        console.log(`[dom-entrypoint.js] Got the votesPageLimit (${window.votesPageLimit})`)
    }

    window.votesScraper = new VotesScraper()
    window.postExpander = new PostExpander()
    window.htmlGenerator = new HtmlGenerator()

    assignPolymorphicGlobals(rpcClient)
}

function detectAndExecuteFunction() {
    let {origin, pathname, search} = window.location
    let searchParams = new URLSearchParams(search)

    if (origin === "https://stackoverflow.com" && pathname.startsWith("/users/") && searchParams.get("tab") === "votes") {
        // The current page is the user profile page. We are in the context for scraping votes.
        votesScraper.scrapeVotes()
    } else if (origin === "https://data.stackexchange.com" && pathname.startsWith("/stackoverflow/query/new")) {
        // The current page is the Stack Exchange Data Explorer. We are in the context for expanding the posts data.
        postExpander.expandPosts().then(() => {
            console.log("Posts were expanded successfully")
            console.log("Opening a new tab to the 'generate-html.html' page...")
            rpcClient.execRemoteProcedure("open-generate-html-page", {})
        })
    } else if (pathname.includes("/generate-html.html")) {
        htmlGenerator.generateHtml().then(() => console.log("HTML was generated successfully"))
    } else {
        console.error(`Unexpected page: ${window.location}`)
    }
}

/**
 *  This is the main function
 */
async function exec() {
    detectEnvironment()
    await downloadScripts()
    console.log("All scripts were included.")
    await configureState()
    detectAndExecuteFunction()
}

// noinspection JSIgnoredPromiseFromCall
exec()
