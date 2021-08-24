// This is an abstraction over the Chrome storage layer.

/**
 * Get the "votes page limit" configuration
 * @return {Promise<Number>} a promise containing the value
 */
function getVotesPageLimit() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("votesPageLimit", (data) => {
            console.log("Read the following data:")
            console.dir()
            console.log({
                data
            })
            resolve(data.votesPageLimit)
        })
    })
}

/**
 * Save a new value for the "votes page limit" configuration
 * @return {Promise<*>} a promise that resolves after the value has been successfully saved
 */
function saveVotesPageLimit(votesPageLimit) {
    return new Promise(resolve => {
        chrome.storage.sync.set({votesPageLimit}, () => {
            console.log(`Saved value '${votesPageLimit}'`);
            resolve()
        })
    })
}
