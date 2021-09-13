// This content script will add JavaScript to the web page that executes the "expand posts" function.

{
    console.debug("[content-script-expand-posts.js] Running...")

    let scriptEl = document.createElement("script")
    scriptEl.src = chrome.runtime.getURL("web/web-expand-posts.js")
    document.head.append(scriptEl)
}
