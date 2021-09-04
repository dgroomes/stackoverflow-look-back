// Core extension initialization code
//
// This code initializes some configuration values and declares the permissions that dictate which pages the extension
// are enabled for. This is a key difference between the extension architectures of Manifest V2 and V3. In V3, we
// declares these permissions in the manifest file itself.

console.log("[init.js] Initializing...")

const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.

chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.log(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`);
    })

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
