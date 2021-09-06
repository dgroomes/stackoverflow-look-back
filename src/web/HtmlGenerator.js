/**
 * Fetch the StackOverflow posts data and generate a static HTML document with it.
 */
class HtmlGenerator {

    /**
     * This is the main function!
     * @return {Promise<void>}
     */
    async generateHtml() {
        let posts = await appStorage.getPosts()
        let postsEl = document.getElementById("posts")

        // Sort the posts data. Every question post is followed by its answer posts.
        // See the "compareFn" parameter for "Array.prototype.sort()": https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        let sorted = posts.sort((postA, postB) => postA.compare() - postB.compare())

        // Known issue. Reduce down to the problematic entries due to CSS grid issue. See the note in the README.
        sorted = sorted.slice(0, 1500) // the 1501st element isn't rendered correctly

        for (let post of sorted) {
            postsEl.insertAdjacentHTML("beforeend", post.toHtml())
        }

        this.downloadHtml()
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
