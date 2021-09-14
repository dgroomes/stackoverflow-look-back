// This code runs in a content script and proxies messages between the web page, background scripts and potentially other
// JavaScript execution environments like extension popup pages.
//
// Wouldn't it be consistent with the design of the repo that this be designed as an RpcServer and multiple RpcClients?
// First of all, it's not consistent in general because it's not using a class, but to be honest, classes are often not
// the right tool for the job.

console.debug("[content-script-rpc-proxy.js] Initializing...")

// Listen for messages from the web page via "window" messages, forward them to the background script, wait for the
// response, and send the response to the window as another message. The web page should be expecting this message.
window.addEventListener("message", ({data}) => {
    console.debug(`[content-script-rpc-proxy.js] Received a message on the 'window'. Here is the 'data':`)
    console.debug({data})
    if (data.procedureTargetReceiver === "content-script-rpc-proxy") {
        data.procedureTargetReceiver = "background"
        let {procedureName} = data

        // Send the message to the background script, and register a handler that forwards the response to the web page.
        chrome.runtime.sendMessage(null,
            data,
            null,
            function (returnValue) {
                console.debug(`[content-script-rpc-proxy.js] Got a response via callback from the extension messaging system:`)
                console.debug({returnValue})

                // Finally, send the response message back to the web page  to the background script, and register a
                // handler that forwards the response to the web page.
                window.postMessage({
                    procedureTargetReceiver: "web-page",
                    procedureName,
                    returnValue
                }, "*")
            })
    }
})
