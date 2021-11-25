import {AppStorage} from "./AppStorage.ts"
import {Post} from "./post.ts"

export {PostsViewer}

declare var appStorage: AppStorage

/**
 * View the posts data on the page.
 */
class PostsViewer {

    readonly #posts : Array<Post>

    constructor(posts: Array<Post>) {
        this.#posts = posts
    }

    /**
     * This is the main function! Get the posts data and render it to the page.
     */
    static async init() : Promise<PostsViewer> {
        const posts = await appStorage.getPosts()
        if (posts.length === 0) {
            throw new Error("Zero posts were found. This is unexpected.")
        }

        const postsViewer = new PostsViewer(posts)

        postsViewer.render(null)
        return postsViewer
    }

    /**
     * Render the posts data into HTML. Optionally, apply a post filtering function.
     *
     * Note that because of the browser's size restriction on CSS grids, we can't place all of the posts in one CSS grid
     * so we have to work around that. Instead, I've chosen to group each question into its own small CSS grid.
     * Unfortunately this is slower (it takes a couple of seconds to render the page) and seems to use more memory. Also,
     * the added bloat in lines of code is unfortunate.
     *
     * @param filterFn an optional filter function that filters the post data. If the filter function returns true for
     * the post, then the post is included.
     * @return {Number} the number of posts rendered
     */
    render(filterFn) {
        const postsEl = document.getElementById("posts")!
        postsEl.innerHTML = "" // Clear all existing content

        // Filter the posts given the optional filter function
        let filtered : Array<Post>
        if (filterFn !== null) {
            filtered = this.#posts.filter(post => filterFn(post))
            if (filtered.length === 0) return 0
        } else {
            filtered = this.#posts
        }

        // Sort the posts data. Every question post is followed by its answer posts.
        // See the "compareFn" parameter for "Array.prototype.sort()": https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        let sorted = filtered.sort((postA, postB) => postA.naturalOrder() - postB.naturalOrder())

        let [first, ...rest] = sorted

        // Group by question. In other words, group each question with all of its answers.
        // Note: this code is a bit silly, I wish I could write a SQL query instead.
        let grouped = rest.reduce((grouped, post) => {
            let latestGroup = grouped[grouped.length - 1]
            let latestQuestionId = latestGroup[0].questionId
            if (post.questionId === latestQuestionId) {
                latestGroup.push(post)
            } else {
                grouped.push([post])
            }
            return grouped
        }, [[first]])

        for (let group of grouped) {
            let html = `<div class="posts">`
            for (let post of group) {
                html += post.toHtml()
            }
            html += `</div>`
            postsEl.insertAdjacentHTML("beforeend", html)
        }

        return filtered.length
    }
}
