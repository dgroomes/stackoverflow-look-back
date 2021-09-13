console.debug("[web-generate-html.js] Running...")

programReady.then(() => {
    let download = "download" === location.hash.substring(1)
    htmlGenerator.generateHtml(download)
        .then(() => console.info("HTML was generated successfully"))
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
}

/**
 * Narrow the rendered StackOverflow posts data by the given search term.
 */
function search() {
    let searchTerm = document.getElementById("search-box").value
    let searchResultsDescriptor = document.getElementById("search-results-descriptor")

    // If there is no search term, then render all posts and hide the search results descriptor
    if (searchTerm.trim() === "") {
        htmlGenerator.render(null)
        searchResultsDescriptor.style.display = "none"
        return
    }

    console.info(`Searching by the search term: ${searchTerm}`)

    let regex = new RegExp(searchTerm, "i")
    let postsRendered = htmlGenerator.render(post => {
        if (post instanceof Question && regex.test(post.title)) {
            return true
        }
        return regex.test(post.htmlBody)
    })

    searchResultsDescriptor.style.display = ""
    searchResultsDescriptor.innerText = `${postsRendered} posts matched the search term: ${searchTerm}`
}
