// This is the common code that is imported by the unique "init.js" files which are defined for each plugin.

/**
 * Set some configuration values in storage.
 *
 * Set a default value for the 'votesPageLimit' configuration
 */
function setConfig() {
    const defaultInitialVotesPageLimit = 2 // a default value for the "votes page limit" configuration.
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.debug(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`)
    })
}
