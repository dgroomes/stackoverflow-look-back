console.debug("[web-expand-posts.js] Running...")

programReady.then(() => {
    // noinspection JSIgnoredPromiseFromCall
    postsExpander.expandPosts().then(() => {
        console.info("Posts were expanded and saved to storage!")
    })
})
