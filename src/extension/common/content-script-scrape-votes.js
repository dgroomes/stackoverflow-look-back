// This content script will add JavaScript to the web page that executes the "scrape votes" function.

{
    console.debug("[content-script-scrape-votes.js] Running...")

    let scriptEl = document.createElement("script")
    scriptEl.src = chrome.runtime.getURL("web/web-scrape-votes.js")
    document.head.append(scriptEl)
}
