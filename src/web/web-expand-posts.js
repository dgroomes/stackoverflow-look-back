console.debug("[web-expand-posts.js] Running...")

programReady.then(() => {
    // noinspection JSIgnoredPromiseFromCall
    postExpander.expandPosts().then(() => {
        console.info("Posts were expanded successfully")
        console.info("Opening a new tab to the 'generate-html.html' page...")
        rpcClient.execRemoteProcedure("open-generate-html-page", {})
    })
})
