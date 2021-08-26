// This is the code to execute the extension functionality on the web page

let global = this

async function exec() {

    // Get the current tab
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    /**
     * Load a JavaScript file into the execution context (I think it's some isolated environment where the extension code runs)
     * @param fileName
     * @return {Promise<*>} a promise that resolves when the file is loaded
     */
    function loadJavaScriptFile(fileName) {
        return chrome.scripting.executeScript({target: {tabId: tab.id}, files: [fileName]})
    }

    async function loadAllJavaScriptFiles() {
        // Load so many source code files... This is a bit unfortunate isn't it! Modules to the rescue? Using modules
        // depends on the support for it in the Chrome extension APIs...
        await loadJavaScriptFile("src/AppStorage.js")
        await loadJavaScriptFile("src/chrome-extension-mode/ChromeModeStorage.js")
        await loadJavaScriptFile("src/RequestInterceptorInstrumenter.js")
        await loadJavaScriptFile("src/RequestInterceptorHandler.js")
        await loadJavaScriptFile("src/chrome-extension-mode/ChromeModeRequestInterceptorInstrumenter.js")
        await loadJavaScriptFile("src/VotesScraper.js")
        await loadJavaScriptFile("src/PostExpander.js")
        await loadJavaScriptFile("src/HtmlGenerator.js")
        await loadJavaScriptFile("src/Config.js")
        await loadJavaScriptFile("src/vote.js")
        await loadJavaScriptFile("src/util/download-to-file.js")
        await loadJavaScriptFile("src/util/to-json.js")
    }

    {
        let executeScrapeVotesButton = document.getElementById("execute-scrape-votes");
        executeScrapeVotesButton.addEventListener("click", async () => {

            await loadAllJavaScriptFiles()
            console.log("Injecting the script...")
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: async () => {
                    // Initialize the configuration
                    await Config.init()
                    // Scrape the votes!
                    votesScraper.scrapeVotes()
                }
            })

            console.log("The script was injected")
        })
    }

    {
        let executeExpandPostsButton = document.getElementById("execute-expand-posts");
        executeExpandPostsButton.addEventListener("click", async () => {

            // The next few lines are the worst design in the whole codebase. I'm hacking around my Config abstraction
            // that I thought would be able to encapsulate this. But we have a split brain problem because of the two
            // executions context at play: 1) the content scripts and 2) the extension itself
            global.requestInterceptorInstrumenter = new ChromeModeRequestInterceptorInstrumenter()
            let postExpander = new PostExpander()
            postExpander.registerHandler()

            await loadAllJavaScriptFiles()
            console.log("Injecting the script...")
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: async () => {
                    // Initialize the configuration
                    await Config.init()
                    // Expand the posts data!
                    await postExpander.expandPosts()
                }
            })

            console.log("The script was injected")
        })
    }

    // todo wire up the click handler and functions for "generate html"
}

console.log("Hello from execute.js")

exec()
    .then(() => console.log("[execute.js#exec] Ran to completion"))
    .catch(e => console.log("[execute.js#exec] Something went wrong", e))
