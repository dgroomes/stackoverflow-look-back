import {PostsViewer} from "../core/posts/PostsViewer"
import {QuestionPost} from "../core/posts/QuestionPost"
import {AppStorage} from "../core/AppStorage"
import * as BrowserExtensionFramework from "@dgroomes/browser-extension-framework"

const init: Promise<PostsViewer> = (async function init(): Promise<PostsViewer> {
    console.debug("[posts-viewer.js] Initializing...");
    const pageWiring = BrowserExtensionFramework.initializePageWiring();
    const postsViewer = await PostsViewer.init(new AppStorage(pageWiring.rpcClient));
    console.info("Initialized. Posts were rendered to HTML successfully");

    pageWiring.satisfied();

    return postsViewer;
})();

{ // Register the search handlers for click events and 'Enter' key presses
    document.getElementById("search-box")!.addEventListener("keyup", async (event) => {
        if (event.key === "Enter") {
            await search();
        }
    });
    document.getElementById("search-button")!.addEventListener("click", async () => {
        await search();
    });
}

/**
 * Narrow the rendered StackOverflow posts data by the given search term.
 */
async function search() {
    const postsViewer: PostsViewer = await init;
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
        if (post instanceof QuestionPost) {
            searchableText += post.title + post.tags.toString()
        }
        return regex.test(searchableText)
    })

    searchResultsDescriptor.style.display = ""
    searchResultsDescriptor.innerText = `${postsRendered} posts matched the search term: ${searchTerm}`
}
