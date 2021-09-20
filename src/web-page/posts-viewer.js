console.debug("[posts-viewer.js] Initializing...")

programReady.then(() => {
    postsViewer.init()
        .then(() => console.info("Posts were rendered to HTML successfully"))
})

{ // Register the search handlers for click events and 'Enter' key presses
    document.getElementById("search-box").addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            search()
        }
    })
    document.getElementById("search-button").addEventListener("click", () => {
        search()
    })

    document.getElementById("download").addEventListener("click", () => {
        postsViewer.downloadHtml()
    })
}

/**
 * Narrow the rendered StackOverflow posts data by the given search term.
 */
function search() {
    let searchTerm = document.getElementById("search-box").value
    let searchResultsDescriptor = document.getElementById("search-results-descriptor")

    // If there is no search term, then render all posts and hide the search results descriptor
    if (searchTerm.trim() === "") {
        postsViewer.render(null)
        searchResultsDescriptor.style.display = "none"
        return
    }

    console.info(`Searching by the search term: ${searchTerm}`)

    let regex = new RegExp(searchTerm, "i")
    let postsRendered = postsViewer.render(function filterPostForSearchTerm(post) {
        // Build a body of text that the search term regular expression will be tested against. Question posts have
        // more content to search over (title and tags) than answer posts.
        let searchableText = post.htmlBody
        if (post instanceof Question) {
            searchableText += post.title + post.tags
        }
        return regex.test(searchableText)
    })

    searchResultsDescriptor.style.display = ""
    searchResultsDescriptor.innerText = `${postsRendered} posts matched the search term: ${searchTerm}`
}
