// Core extension initialization code
//
// This code initializes some configuration values.
//
// Note that this file must be in the web extension's root directory (the same directory as the manifest.json file) because
// of the way Chrome service workers work. See the "Gotchas" note at https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/

const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.

chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.log(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`);
    })
})
