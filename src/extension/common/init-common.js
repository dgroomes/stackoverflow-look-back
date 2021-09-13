// This is the common code that is imported by the unique "init.js" files which are defined for each plugin.
// Register a listener for message passing to the web page.

// Set a default value for the 'votesPageLimit' configuration
function setDefaultConfig() {
    const defaultInitialVotesPageLimit = 1 // a default value for the "votes page limit" configuration.
    chrome.storage.local.set({votesPageLimit: defaultInitialVotesPageLimit}, () => {
        console.debug(`[init.js] Saved default value for 'votesPageLimit': '${defaultInitialVotesPageLimit}'`)
    })
}

/**
 * Create an RPC server in the background script that will receive remote procedure call (RPC) requests from the front-end
 * and then executes those requests.
 *
 * @param rpcClass the concrete sub-classes of RpcServer that will be created
 */
function addRpcServer(rpcClass) {

    let rpcServer = new rpcClass()

    rpcServer.registerCallbackProcedure("save", (procedureArgs, resolve) => {
        chrome.storage.local.set(procedureArgs, () => {
            console.debug("The extension successfully saved the data")
            resolve(true)
        })
    })

    rpcServer.registerCallbackProcedure("get", (procedureArgs, resolve) => {
        let key = procedureArgs.key
        chrome.storage.local.get(key, (found) => {
            console.debug("The extension successfully read the data")
            resolve(found)
        })
    })

    rpcServer.listen()
}
