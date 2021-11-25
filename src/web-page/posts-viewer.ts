import {Question} from "./post.ts"
import {exec} from "./web-load-source.ts"
import {PostsViewer} from "./PostsViewer.ts"

console.debug("[posts-viewer.js] Initializing...")

declare var postsViewer: PostsViewer

exec().then(() => {
    postsViewer.init()
        .then(() => console.info("Posts were rendered to HTML successfully"))
})

{ // Register the search handlers for click events and 'Enter' key presses
    document.getElementById("search-box")!.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            search()
        }
    })
    document.getElementById("search-button")!.addEventListener("click", () => {
        search()
    })
}

/**
 * Narrow the rendered StackOverflow posts data by the given search term.
 */
function search() {
    const searchTerm = (<HTMLInputElement>document.getElementById("search-box")!).value
    const searchResultsDescriptor = document.getElementById("search-results-descriptor")!

    // If there is no search term, then render all posts and hide the search results descriptor
    if (searchTerm.trim() === "") {
        postsViewer.render(null)
        searchResultsDescriptor.style.display = "none"
        return
    }

    console.info(`Searching by the search term: ${searchTerm}`)

    const regex = new RegExp(searchTerm, "i")
    const postsRendered = postsViewer.render(function filterPostForSearchTerm(post) {
        // Build a body of text that the search term regular expression will be tested against. Question posts have
        // more content to search over (title and tags) than answer posts.
        let searchableText = post.htmlBody
        if (post instanceof Question) {
            searchableText += post.title + post.tags.toString()
        }
        return regex.test(searchableText)
    })

    searchResultsDescriptor.style.display = ""
    searchResultsDescriptor.innerText = `${postsRendered} posts matched the search term: ${searchTerm}`
}
