// This code runs on the web page. It downloads all of the other JavaScript source files into the web page by adding
// "script" tags. It also does some initialization to wire up the main objects and variables.

console.debug("[web-load-source.js] Initializing...")

let browserDescriptor // Either "chromium" or "firefox. Firefox and Chromium web extension APIs have differences and we need to know the browser.
let extensionContext // Is the web page served directly by the extension? I.e. is the web page at a URL starting with "chrome-extension://"
let webResourcesOrigin // The origin that serves the web resources like the JavaScript files. This origin will be a special Chromium/Firefox extension URL.
let webExtensionId // This is the ID of the web extension. This is always a super long ID that's generated the browser.
let _programReadyResolveRef
programReady = new Promise(resolve => _programReadyResolveRef = resolve) // A promise that will resolve when the program is ready. I.e. all of the JavaScript source files have been loaded and the objects have been wired up

/**
 * Detect the current environment and assign the following global properties:
 *   - browserDescriptor
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
     *               - chrome-extension://akidegfimbjmokpejlcnjagogamdiinl/web-page/posts-viewer.html
     *               - moz-extension://df0b610b-995b-9240-8c3b-fcaf155c9005/web-page/web-load-source.js
     */
    function detectFromExtensionUrl(url) {
        let regex = new RegExp("(chrome-extension|moz-extension)://([a-z0-9-]+)")
        let matches = regex.exec(url)
        webResourcesOrigin = matches[0]

        let host = matches[1]
        if (host === "chrome-extension")
            browserDescriptor = "chromium"
        else if (host === "moz-extension") {
            browserDescriptor = "firefox"
        } else {
            throw new Error(`Unrecognized host name: '${host}', Expected either 'chrome-extension' or 'moz-extension'`)
        }

        webExtensionId = matches[2]
    }

    // The "posts-viewer.html" page itself is served by the web extension and so the URL protocol will be
    // "chrome-extension://" or "moz-extension://"
    if (window.origin.startsWith("chrome-extension://") || window.origin.startsWith("moz-extension://")) {
        extensionContext = true
        detectFromExtensionUrl(window.origin)
        return
    }

    extensionContext = false

    let script = document.getElementById("web-load-source")
    detectFromExtensionUrl(script.src)
}

/**
 * Load all scripts
 * @return {Promise} a promise that resolves when all scripts have loaded into the page. Specifically, all script
 * elements will have called their 'onload' functions.
 */
function downloadScripts() {
    const noDepsScripts = [
        "rpc/RpcClient.js",
        "rpc/RpcServer.js",
        "web-page/AppStorage.js",
        "web-page/VotesScraper.js",
        "web-page/PostsExpander.js",
        "web-page/PostsViewer.js",
        "web-page/vote.js",
        "web-page/post.js",
        "web-page/util/download-to-file.js",
        "web-page/util/jquery-proxy.js",
        "web-page/util/to-json.js"
    ]

    // These files depend on another file already having been loaded because they use the "extends" keyword at the
    // top-level. If I used the module system would this not be a problem?
    const oneDepsScripts = [
        "rpc/ChromiumWebPageToBackgroundRpcClient.js",
        "rpc/FirefoxWebPageToContentScriptRpcClient.js",
        "rpc/ChromiumWebPageRpcServer.js",
        "rpc/FirefoxWebPageRpcServer.js"
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
        el.src = `${webResourcesOrigin}/${fileName}`
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
     * @param {RpcServer} rpcServer
     */
    function assignPolymorphicGlobals(rpcClient, rpcServer) {
        window.rpcClient = rpcClient
        window.rpcServer = rpcServer
    }

    let rpcClient
    let rpcServer

    if (browserDescriptor === "chromium") {
        rpcClient = new ChromiumWebPageToBackgroundRpcClient(webExtensionId)
        rpcServer = new ChromiumWebPageRpcServer()
    } else if (browserDescriptor === "firefox") {
        rpcClient = new FirefoxWebPageToContentScriptRpcClient(webExtensionId)
        rpcServer = new FirefoxWebPageRpcServer()
    } else {
        throw new Error(`Unexpected browser: ${browserDescriptor}. Expected either 'chromium' or 'firefox'`)
    }

    rpcServer.registerCallbackProcedure("scrape-votes", (_procedureArgs, _resolve) => {
        votesScraper.scrapeVotes()
    })
    rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
        return postsExpander.expandPosts()
    })
    rpcServer.listen()

    window.appStorage = new AppStorage(rpcClient)

    if (!extensionContext) { // This is hacky. But when executing in an extension context, this call will fail because there is no listener.
        console.debug(`[web-load-source.js] Fetching the votesPageLimit`)
        window.votesPageLimit = await appStorage.getVotesPageLimit()
        console.debug(`[web-load-source.js] Got the votesPageLimit (${window.votesPageLimit})`)
    }

    window.votesScraper = new VotesScraper()
    window.postsExpander = new PostsExpander()
    window.postsViewer = new PostsViewer()

    assignPolymorphicGlobals(rpcClient, rpcServer)
}

/**
 *  This is the main function
 */
async function exec() {
    detectEnvironment()
    await downloadScripts()
    console.debug("All scripts were included.")
    await configureState()
    console.debug(`[web-load-source.js] [${Date.now()}] Fully initialized.`)
    window.postMessage("web-page-initialized", "*")
    _programReadyResolveRef()
}

// noinspection JSIgnoredPromiseFromCall
exec()
