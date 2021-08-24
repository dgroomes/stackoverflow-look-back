// Initialization code
//
// Note that this file must be in the web extension's root directory (the same directory as the manifest.json file) because
// of the way Chrome service workers work. See the "Gotchas" note at https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/

importScripts('/src/persistence.js')

const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.

chrome.runtime.onInstalled.addListener(async () => {
    await saveVotesPageLimit(defaultInitialVotesPageLimit)
    console.log("The 'onInstalled' hook ran to completion.")
});
