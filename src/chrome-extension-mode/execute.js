// This is the code to execute the extension functionality on the web page

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

    {
        let executeScrapeVotesButton = document.getElementById("execute-scrape-votes");
        executeScrapeVotesButton.addEventListener("click", async () => {

            // Load so many source code files... This is a bit unfortunate isn't it! Modules to the rescue? Using modules
            // depends on the support for it in the Chrome extension APIs...
            await loadJavaScriptFile("src/AppStorage.js")
            await loadJavaScriptFile("src/chrome-extension-mode/ChromeModeStorage.js")
            await loadJavaScriptFile("src/Config.js")
            await loadJavaScriptFile("src/VotesScraper.js")
            await loadJavaScriptFile("src/vote.js")
            await loadJavaScriptFile("src/util/download-to-file.js")
            await loadJavaScriptFile("src/util/to-json.js")

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
    // todo wire up the click handler and functions for "expand posts"
    // todo wire up the click handler and functions for "generate html"
}

console.log("Hello from execute.js")

exec()
    .then(() => console.log("[execute.js#exec] Ran to completion"))
    .catch(e => console.log("[execute.js#exec] Something went wrong", e))
