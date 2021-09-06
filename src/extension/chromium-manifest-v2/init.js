// Core extension initialization code for the "Chromium Manifest V2" web extension.
//
// This declares the permissions that dictate which pages the extension are enabled for.

console.log("[chromium-manifest-v2/init.js] Initializing...")

browserDescriptor = "chromium"

chrome.runtime.onInstalled.addListener(() => {

    setDefaultConfig()

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'stackoverflow.com'},
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'data.stackexchange.com'},
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }])
    })
})

addRpcListener()
