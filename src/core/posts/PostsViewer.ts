import {AppStorage} from "../AppStorage"
import {Post} from "./Post"
import {downloadToFile} from "../../../util/download";

export {PostsViewer}

/**
 * View a summary of the posts data.
 *
 * This fetches the posts data from the back-end and renders a summarization of the data in HTML. The data can be
 * downloaded to a file.
 */
class PostsViewer {

    readonly #posts: Array<Post>

    constructor(posts: Array<Post>) {
        this.#posts = posts
    }

    /**
     * This is the main function! Get the posts data and render a summary of it to the page.
     */
    static async init(appStorage: AppStorage): Promise<PostsViewer> {
        const posts = await appStorage.getPosts()
        if (posts.length === 0) {
            throw new Error("Zero posts were found. This is unexpected.")
        }

        const postsViewer = new PostsViewer(posts)
        postsViewer.render()
        return postsViewer
    }

    /**
     * Render a summary of the posts data in HTML.
     */
    render() {
        const summaryEl = document.getElementById("summary")!
        summaryEl.innerHTML = "" // Clear all existing content

        // Sort the posts data. Every question post is followed by its answer posts.
        // See the "compareFn" parameter for "Array.prototype.sort()": https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        let sorted = this.#posts.sort((postA, postB) => postA.naturalOrder() - postB.naturalOrder())

        let [first, ...rest] = sorted

        // Group by question. In other words, group each question with all of its answers.
        // Note: this code is a bit silly, I wish I could write a SQL query instead.
        let grouped = rest.reduce((grouped, post) => {
            let latestGroup = grouped[grouped.length - 1];
            let latestQuestionId = latestGroup[0].questionId;
            if (post.questionId === latestQuestionId) {
                latestGroup.push(post);
            } else {
                grouped.push([post]);
            }
            return grouped
        }, [[first]]);

        let html = `
<div class="summary">
    There are ${this.#posts.length} posts across ${grouped.length} groups of questions and answers.
</div>`;
        summaryEl.insertAdjacentHTML("beforeend", html);
    }

    download() {
        const data = JSON.stringify(this.#posts, null, 2);
        downloadToFile(data, "stackoverflow-posts.json");
    }
}
