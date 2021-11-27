import {chrome} from "../web-extension-types/chrome-extension-types.d.ts"
export {executeInstrumentedContentScript}

/**
 * Execute a "web-page-bootstrapping content script JavaScript file" as a content script.
 *
 * This function must be called from a background or popup script.
 *
 * This function would be used to execute the "dcl-content-script.js" file as described in the "Detect Code Libraries"
 * example in the README.
 *
 * @return a promise that resolves when the related page script has been loaded and has given the "page-script-satisfied"
 * signal.
 */
async function executeInstrumentedContentScript(fileName) : Promise<void> {
    await execContentScript("/rpc-framework/rpc-content-script.js")
    console.debug(`[inject-script.js] Executing content script: ${fileName}`)

    // Set up a messaging system listener that waits for the "page-script-satisfied" signal.
    //
    // It's important that this listener be created before the execution of the content script (which implies that it is
    // also before the injection of the page script). If the listener is created after the content script starts
    // executing, then there is a race condition where the content script and page script might complete and send the
    // "page-script-satisfied" signal before the listener is even created. In that case, the listener was too late.
    const pageScriptSatisfied: Promise<void> = new Promise<void>(resolve => {
        console.debug(`[inject-script.js] [${Date.now()}] Registering listener for 'page-script-satisfied'`)
        chrome.runtime.onMessage.addListener(function pageScriptSatisfiedListener(message, _sender, _sendResponse) {
            console.debug("[inject-script.js] Received a message from the extension messaging system:")
            console.debug(JSON.stringify({message}, null, 2))
            if (message === "page-script-satisfied") {
                console.debug(`[inject-script.js] Detected that the page script has been loaded into the web page and is satisfied`)
                resolve(undefined)
                chrome.runtime.onMessage.removeListener(pageScriptSatisfiedListener)
            }
        })
    })

    // Execute the content-script. We don't bother to register a callback because it would be redundant. We already set
    // up the "pageScriptSatisfied". Technically, it might be effective to register a callback if there was a chance
    // that the "executeScript" operation failed. But I don't know if the callback is called only on success or if it
    // is also called on failure. And if it is called on failure, what arguments are passed? Error scenarios are not
    // documented in the Chrome docs: https://developer.chrome.com/docs/extensions/reference/tabs/#method-executeScript
    chrome.tabs.executeScript({file: fileName})

    await pageScriptSatisfied
}

/**
 * Execute a content script.
 *
 * @param fileName the file name of the content script
 * @return a promise that resolves when the content script has been loaded/executed(?)
 */
async function execContentScript(fileName: string) : Promise<void> {
    console.debug(`[popup.js] Executing content script: ${fileName}`)
    return new Promise(resolve => {
        chrome.tabs.executeScript({
            file: fileName
        }, () => {
            resolve(undefined)
        })
    })
}
