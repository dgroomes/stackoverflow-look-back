// This code runs on the web page. It downloads all of the other JavaScript source files into the web page by adding
// "script" tags. It also does some initialization to wire up the main objects and variables.

import {initRpcWebPage} from "../rpc/rpc-web-page.js"

console.debug("[web-load-source.js] Initializing...")

let browserDescriptor // Either "chromium" or "firefox. Firefox and Chromium web extension APIs have differences and we need to know the browser.
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
        detectFromExtensionUrl(window.origin)
        return
    }

    let script = document.getElementById("web-load-source")
    detectFromExtensionUrl(script.src)
}

/**
 * Load all scripts
 * @return {Promise} a promise that resolves when all scripts have loaded into the page. Specifically, all script
 * elements will have called their 'onload' functions.
 */
function downloadScripts() {
    const scripts = [
        "web-page/AppStorage.js",
        "web-page/VotesScraper.js",
        "web-page/PostsExpander.js",
        "web-page/PostsViewer.js",
        "web-page/vote.js",
        "web-page/post.js",
        "web-page/util/jquery-proxy.js",
        "web-page/util/to-json.js"
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

    return Promise.all(scripts.map(fileName => includeScript(fileName)))
}

async function configureState() {

    initRpcWebPage(browserDescriptor, webExtensionId)

    rpcServer.registerPromiseProcedure("scrape-votes", (procedureArgs) => {
        let votesScraper = new VotesScraper(procedureArgs.votesPageLimit)
        return votesScraper.scrapeVotes()
    })
    rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
        return postsExpander.expandPosts()
    })
    rpcServer.listen()

    window.appStorage = new AppStorage(rpcClient)
    window.postsExpander = new PostsExpander()
    window.postsViewer = new PostsViewer()
}

/**
 *  This is the main function
 */
async function exec() {
    detectEnvironment()
    await downloadScripts()
    await configureState()
    console.debug(`[web-load-source.js] [${Date.now()}] Fully initialized.`)
    window.postMessage("web-page-initialized", "*")
    _programReadyResolveRef()
}

// noinspection JSIgnoredPromiseFromCall
exec()
