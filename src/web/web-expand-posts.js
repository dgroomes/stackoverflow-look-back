console.log("[web-expand-posts.js] Running...")

programReady.then(() => {
    // noinspection JSIgnoredPromiseFromCall
    postExpander.expandPosts().then(() => {
        console.log("Posts were expanded successfully")
        console.log("Opening a new tab to the 'generate-html.html' page...")
        rpcClient.execRemoteProcedure("open-generate-html-page", {})
    })
})
