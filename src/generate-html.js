"use strict";

// Fetch the StackOverflow posts data and generate a static HTML document with it.

/**
 * Fetch the posts data (questions and answers) from the local web server
 * @return {array<Post>} array of posts data
 */
async function fetchPostsData() {
    let postsData = await fetch(`${origin}/stackoverflow-posts.json`)
        .then(response => response.json())

    return postsData.map(postData => Post.deserialize(postData))
}

/**
 * Sort the posts data. Every question post is followed by its answer posts.
 * @param {array<Post>} posts
 */
function sortPosts(posts) {
    return posts.sort(post => {
        if (post instanceof Question) {
            return [post.id, 0]
        } else {
            return [post.questionId, post.id]
        }
    })
}

/**
 * This is the main function!
 * @return {Promise<void>}
 */
async function generateHtml() {
    let posts = await fetchPostsData()
    // Known issue. Reduce down to the problematic entries due to CSS grid issue. See the note in the README.
    posts = posts.slice(0, 1500) // the 1501st element isn't rendered correctly

    let postsEl = document.getElementById("posts");

    for (let post of sortPosts(posts)) {
        postsEl.insertAdjacentHTML("beforeend", post.toHtml())
    }

    downloadHtml()
}

/**
 * Serialize the whole document to an HTML string and download it to a file.
 */
function downloadHtml() {
    // The styles from linked stylesheets will not be serialized without extra effort. The styles must be copied into a
    // <style> tag.
    let style = document.createElement("style");
    style.textContent = Array.from(document.styleSheets[0].cssRules)
        .map(rule => rule.cssText)
        .join("\n");
    document.head.prepend(style)

    // Remove the 'link' elements since the styles are now embedded in a 'style' element
    for (let link of document.getElementsByTagName("link")) {
        link.remove()
    }

    let serializer = new XMLSerializer();
    let html = serializer.serializeToString(document);

    downloadToFile(html, "stackoverflow-posts.html")

    document.body.innerHTML = "<p>This page generated a static HTML document with the given StackOverflow data and downloaded it to a file. See the README.md for more information.</p>"
}
