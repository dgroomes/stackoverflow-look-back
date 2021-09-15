console.debug("[posts-viewer.js] Running...")

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
    let postsRendered = postsViewer.render(post => {
        if (post instanceof Question && regex.test(post.title)) {
            return true
        }
        return regex.test(post.htmlBody)
    })

    searchResultsDescriptor.style.display = ""
    searchResultsDescriptor.innerText = `${postsRendered} posts matched the search term: ${searchTerm}`
}
