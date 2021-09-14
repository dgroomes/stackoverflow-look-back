// This code runs in a content script and proxies messages between the web page, background scripts and potentially other
// JavaScript execution environments like extension popup pages.
//
// Wouldn't it be consistent with the design of the repo that this be designed as an RpcServer and multiple RpcClients?
// First of all, it's not consistent in general because it's not using a class, but to be honest, classes are often not
// the right tool for the job.

console.debug("[content-script-rpc-proxy.js] Initializing...")

// Connect web page RPC clients to background RPC servers.
//
// Listen for "RPC request" messages on the window and forward them to an RPC server via the extension messaging system.
// Wait for a return value and then broadcast it to the window as another message. The web page should be expecting this
// message.
//
// This is only needed for Firefox. Chromium browsers, by contrast, give the web page special access to the extension
// messaging API thanks to the "externally_connectable" Manifest field.
//
// In the future, a similar listener will be implemented which connects RPC clients and servers in the opposite
// direction: background RPC clients will make RPC requests to web page RPC servers. All procedure request objects include
// a "procedureTargetReceiver" field to make it unambiguously clear where the RPC request is intended for.
window.addEventListener("message", ({data}) => {
    console.debug(`[content-script-rpc-proxy.js] Received a message on the 'window'. Here is the 'data':`)
    console.debug(JSON.stringify({data}, null, 2))

    if (data.procedureTargetReceiver !== "content-script-rpc-proxy") return

    let {procedureName, procedureArgs} = data

    // Send the message to the background script, and register a handler that forwards the response to the web page.
    let messageToMessagingSystem = {
        procedureTargetReceiver: "background-server",
        procedureName,
        procedureArgs
    }
    console.debug("[content-script-rpc-proxy.js] Sending an RPC request message to the extension messaging system:")
    console.debug(JSON.stringify(messageToMessagingSystem, null, 2))
    chrome.runtime.sendMessage(null,
        messageToMessagingSystem,
        null,
        function (returnValue) {
            console.debug(`[content-script-rpc-proxy.js] Got a response via callback from the extension messaging system:`)
            console.debug({returnValue})

            // While technically not necessary, I've found this error handling and logging useful. While developing the
            // RPC framework, I frequently get an "undefined" here and so the nicer logging makes for a less frustrating
            // development experience.
            if (typeof returnValue === "undefined") {
                let errorMsg = `[content-script-rpc-proxy.js] Something went wrong. This is likely a programmer error. Got an 'undefined' return value from the extension messaging system for an RPC request for '${procedureName}'.`

                // It is not enough to just throw the error on the next line. The error actually gets silently swallowed
                // by the browser's extension framework and you will never see the error in the logs. Instead we
                // manually log an error message to the console.
                console.error(errorMsg)
                throw new Error(errorMsg)
            }

            // Finally, send the return value to the window so that it may be received by the web page
            let messageToWindow = {
                procedureTargetReceiver: "web-page-client",
                procedureName,
                returnValue
            }
            window.postMessage(messageToWindow, "*")
        })
})
