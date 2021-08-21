"use strict";

// Fetch the StackOverflow posts data and generate a static HTML document with it.

/**
 * Fetch the posts data (questions and answers) from the local web server
 * @return {array} array of posts data
 */
async function fetchPostsData() {
    return await fetch(`${origin}/stackoverflow-posts.json`)
        .then(response => response.json())
}

/**
 * Group the posts data by question. Answer posts should be grouped with their parent question.
 * @param posts
 */
function groupByQuestion(posts) {
    let map = new Map()

    for (let post of posts) {
        let questionId
        let insert
        if (post.type === "answer") {
            questionId = post.parentId
            insert = (entry) => entry.answers.push(post)
        } else {
            questionId = post.id
            insert = (entry) => entry.question = post
        }

        let entry
        if (!map.has(questionId)) {
            entry = {answers: []}
            map.set(questionId, entry)
        } else {
            entry = map.get(questionId)
        }

        insert(entry)
    }

    return map
}

/**
 * Generate the HTML for a question post
 * @param post a StackOverflow post of type "question"
 * @return {string} HTML
 */
function questionHtml(post) {
    return `<a class="question-answer-moniker" href="https://stackoverflow.com/q/${post.id}">Q</a>
<div>
    <h1 class="question-title">${post.title}</h1>
    ${post.htmlBody}
</div>`
}

/**
 * Generate the HTML for an answer post
 * @param post a StackOverflow post of type "answer"
 * @return {string} HTML
 */
function answerHtml(post) {
    return `<a class="question-answer-moniker" href="https://stackoverflow.com/a/${post.id}">A</a>
<div>
    ${post.htmlBody}
</div>`
}

/**
 * This is the main function!
 * @return {Promise<void>}
 */
async function exec() {
    let posts = await fetchPostsData()
    console.log(`posts.length: ${posts.length}`)
    // Known issue. Reduce down to the problematic entries due to CSS grid issue. See the note in the README.
    posts = posts.slice(0, 1500) // the 1501st element isn't rendered correctly

    let grouped = groupByQuestion(posts)
    console.log({grouped})

    let postsEl = document.getElementById("posts");

    for (let [questionId, {question, answers}] of grouped) {

        if (question === undefined) {
            console.warn(`The question post is missing for question #${questionId}`)
            continue
        }

        postsEl.insertAdjacentHTML("beforeend", questionHtml(question))

        for (let answer of answers) {
            postsEl.insertAdjacentHTML("beforeend", answerHtml(answer))
        }
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
    let htmlEncoded = encodeURIComponent(html)

    let el = document.createElement("a")
    el.setAttribute("href", `data:text/html,${htmlEncoded}`)
    el.setAttribute("download", "stackoverflow-posts.html")
    el.click()

    document.body.innerHTML = "<p>This page generated a static HTML document with the given StackOverflow data and downloaded it to a file. See the README.md for more information.</p>"
}

exec()
