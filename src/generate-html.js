'use strict';

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
    return `
<div class="post">
    <h1 class="question-title">${post.title}</h1>
    <div style="float: left; font-size: 300%; padding: 50px"><a href="https://stackoverflow.com/q/${post.id}">Q</a></div> 
    ${post.htmlBody}
</div>`
}

/**
 * Generate the HTML for an answer post
 * @param post a StackOverflow post of type "answer"
 * @return {string} HTML
 */
function answerHtml(post) {
    return `
<div class="post">
    <div style="float: left; font-size: 300%; padding: 50px"><a href="https://stackoverflow.com/a/${post.id}">A</a></div> 
    ${post.htmlBody}
</div>`
}

/**
 * This is the main function!
 * @return {Promise<void>}
 */
async function exec() {
    let posts = await fetchPostsData()

    let grouped = groupByQuestion(posts)
    console.log({grouped})

    let postsEl = document.getElementById("posts");

    for (let [questionId, {question, answers}] of grouped) {

        if (question === undefined) {
            console.warn(`The question post is missing for question #${questionId}`)
            continue
        }

        postsEl.insertAdjacentHTML('beforeend', questionHtml(question))

        for (let answer of answers) {
            postsEl.insertAdjacentHTML('beforeend', answerHtml(answer))
        }

        postsEl.insertAdjacentHTML('beforeend', `<hr>`)
    }
}

exec()
