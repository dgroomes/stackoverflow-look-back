// Core extension initialization code for the "Chrome Manifest V2" web extension.
//
// This declares the permissions that dictate which pages the extension are enabled for. This is a key difference
// between the extension architectures of Manifest V2 and V3. In V3, we declares these permissions in the manifest file
// itself.

console.log("[chrome-manifest-v2/init.js] Initializing...")

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
        }]);
    });
})

addCommandsListener()
