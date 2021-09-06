// This code runs in a content-script and proxies messages between the web page and the extension's background scripts.

console.log("[content-script-messaging-proxy.js] Initializing...")

// Listen for messages from the web page and forward them to the background scripts.
window.addEventListener("message", ({data}) => {
    if (data.sender !== "content-script-messaging-proxy") { // Filter out messages sent by this script to avoid an infinite loop

        // Send the message to the background script, and register a handler that forwards the response to the web page.
        chrome.runtime.sendMessage(null,
            data.payload,
            null,
            function (found) {
                console.log(`[content-script-messaging-proxy.js] Got a response via callback from the extension messaging system: ${jsonify(found)}`)

                // Finally, send the response message back to the web page  to the background script, and register a handler that forwards the response to the web page.
                window.postMessage({
                    sender: "content-script-messaging-proxy",
                    callerId: data.callerId,
                    payload: found
                }, "*")
            })
    }
})

/**
 * JSONify an object. This is especially useful for logging.
 */
function jsonify(obj) {
    return JSON.stringify(obj, null, 2)
}
