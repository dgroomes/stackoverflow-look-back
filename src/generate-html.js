"use strict";

// Fetch the StackOverflow posts data and generate a static HTML document with it.

/**
 * Fetch the posts data (questions and answers) from the local web server
 * @return {array<Post>} array of posts data
 */
async function fetchPostsData() {
    let json = await fetch(`${origin}/stackoverflow-posts.json`)
        .then(response => response.json())

    return json.map(post => {
        if (post.type === "question") {
            return new Question(post.id, post.title, post.htmlBody)
        } else if (post.type === "answer") {
            return new Answer(post.id, post.questionId, post.htmlBody)
        } else {
            throw new Error(`Unrecognized post type '${post.type}'`)
        }
    })
}

/**
 * Group the posts data by question. Answer posts should be grouped with their parent question.
 * @param {array<Post>} posts
 */
function groupByQuestion(posts) {
    let map = new Map()

    for (let post of posts) {
        let questionId
        let insert
        if (post instanceof Answer) {
            questionId = post.questionId
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
 * @param {Question} question a StackOverflow post of type "question"
 * @return {string} HTML
 */
function questionHtml(question) {
    return `<a class="question-answer-moniker" href="https://stackoverflow.com/q/${question.id}">Q</a>
<div>
    <h1 class="question-title">${question.title}</h1>
    ${question.htmlBody}
</div>`
}

/**
 * Generate the HTML for an answer post
 * @param {Answer} answer a StackOverflow post of type "answer"
 * @return {string} HTML
 */
function answerHtml(answer) {
    return `<a class="question-answer-moniker" href="https://stackoverflow.com/a/${answer.id}">A</a>
<div>
    ${answer.htmlBody}
</div>`
}

/**
 * This is the main function!
 * @return {Promise<void>}
 */
async function generateHtml() {
    let posts = await fetchPostsData()
    // Known issue. Reduce down to the problematic entries due to CSS grid issue. See the note in the README.
    posts = posts.slice(0, 1500) // the 1501st element isn't rendered correctly

    let grouped = groupByQuestion(posts)
    console.log({grouped})

    let postsEl = document.getElementById("posts");

    for (let [questionId, {question, answers}] of grouped) {
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

    downloadToFile(html, "stackoverflow-posts.html")

    document.body.innerHTML = "<p>This page generated a static HTML document with the given StackOverflow data and downloaded it to a file. See the README.md for more information.</p>"
}
