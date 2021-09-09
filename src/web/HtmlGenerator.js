/**
 * Fetch the StackOverflow posts data and generate a static HTML document with it.
 */
class HtmlGenerator {

    /**
     * This is the main function!
     * Note that because of the browser's size restriction on CSS grids, we can't place all of the posts in one CSS grid
     * so we have to work around that. Instead, I've chosen to group each question into its own small CSS grid.
     * Unfortunately this is slower (it takes a couple of seconds to render the page) and seems to use more memory. Also,
     * the added bloat in lines of code is unfortunate.
     * @param download whether to download the file or not
     * @return {Promise<void>}
     */
    async generateHtml(download) {
        let posts = await appStorage.getPosts()
        if (posts.length === 0) {
            throw new Error("Zero posts were found. This is unexpected.")
        }
        let postsEl = document.getElementById("posts")

        // Sort the posts data. Every question post is followed by its answer posts.
        // See the "compareFn" parameter for "Array.prototype.sort()": https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        let sorted = posts.sort((postA, postB) => postA.compare() - postB.compare())

        let [first, ...rest] = sorted

        // Group by question. In other words, group each question with all of its answers.
        // Note: this code is a bit silly, I wish I could write a SQL query instead.
        let grouped = rest.reduce((grouped, post) => {
            let latestGroup = grouped[grouped.length - 1];
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

        if (download) {
            this.downloadHtml()
        }
    }

    /**
     * Serialize the whole document to an HTML string and download it to a file.
     */
    downloadHtml() {
        // The styles from linked stylesheets will not be serialized without extra effort. The styles must be copied into a
        // <style> tag.
        let style = document.createElement("style")
        style.textContent = Array.from(document.styleSheets[0].cssRules)
            .map(rule => rule.cssText)
            .join("\n")
        document.head.prepend(style)

        // Remove the 'link' elements since the styles are now embedded in a 'style' element
        for (let link of document.getElementsByTagName("link")) {
            link.remove()
        }

        let serializer = new XMLSerializer()
        let html = serializer.serializeToString(document)

        downloadToFile(html, "stackoverflow-posts.html")

        document.body.innerHTML = "<p>This page generated a static HTML document with the given StackOverflow data and downloaded it to a file. See the README.md for more information.</p>"
    }
}
