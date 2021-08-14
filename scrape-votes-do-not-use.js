#!/usr/bin/env node

// DO NOT USE. This script was my first attempt to scrape the StackOverflow votes data from my profile page. While the 'jsdom'
// library is really cool, it's not necessary to venture out of the browser and into NodeJS to get this job done. Instead,
// we can scrape the votes data from the web page's own execution environment! There are a few conveniences offered by the
// "in-browser" approach compared to the NodeJS approach: 1) no need to think about authentication/cookies! You are already
// logged in to StackOverflow in the browser! 2) No need for third-party libraries. On the other hand, the biggest downside
// is that the in-browser approach is "headful" (compared to a "headless" approach in NodeJS).

const
    fetch = require("node-fetch"),
    voteType = Symbol('voteType'),
    question = Symbol('question'),
    postUrl = Symbol('postUrl'),
    answer = Symbol('answer'),
    {JSDOM} = require("jsdom");

// Scrape my own StackOverflow votes data from my profile page.
// This requires authentication.
// Why scrape for this data and not get it via the StackExchange Data Explorer (SEDE; https://data.stackexchange.com/)? Unfortunately,
// upvote and downvote data is private. It is anonymized in SEDE. Also, strangely, the API doesn't support it either.
// So it must be scraped from the HTML.

// TODO reduce the request down to the simplest thing that will still work. Omit all unnecessary headers and unnecessary
//  query parameters.

let votes = [] // The votes data will be scraped from the HTML and collected as "usefully organized" data objects into this array
let origin = "http://[::1]:8080"
let userId = 1333713
let page = 1
let url = `${origin}/ajax/users/tab/${userId}?tab=votes&sort=upvote&page=${page}&_=1628797407009"`

fetch(url, {
    "method": "GET",
    "mode": "cors"
}).then(resp => {
    let status = resp.status
    if (status !== 200) {
        throw new Error(`Unexpected HTTP response status for the scrape request. Found status: ${status}`)
    }
    return resp.text()
})
    .then(body => {
        console.log({body})
        let dom = new JSDOM(body)
        let document = dom.window.document


        // Get all row elements of the "Votes cast" table.
        // Each row represents an up-voted question OR up-voted answer. (Does it include up-voted comments?)
        //
        // Unfortunately, there is no class name attached to the "votes" HTML elements which could clearly identify these
        // elements as "votes". In the absence of this, we can make the query selector more semantic by at least including
        // the "#user-tab-votes" string to convey that we are looking for HTML elements on the "Votes" section of the page
        // and not anywhere else. We can't guarantee that there isn't another HTML table on the page, so specific a query
        // selector is best. UPDATE: all rows have the 'data-postid' attribute so that's pretty expressive.
        let votesRows = document.querySelectorAll('#user-tab-votes tr[data-postid]')

        console.log({rows: votesRows, "length": votesRows.length})

        // Extract the data from each vote row HTML element.
        //
        // Note that each row will either be an up-voted question or up-voted answer:
        // * Answer rows will always have an anchor tag ('a') with a class named "answer-hyperlink"
        // * Question rows will always have an anchor tag ('a') with a class named "question-hyperlink"
        for (let row of votesRows) {

            let vote = {}

            // All rows will have an anchor tag which links to the up-voted post. This anchor tag is always inside of a
            // 'b' tag.
            let anchor = row.querySelector('b a')

            // todo extract the data from the 'date_brick' 'td'

            // todo If it is a question, extract the up-voted question link

            if (anchor.classList.contains('question-hyperlink')) {
                vote[voteType] = question
            } else if (anchor.classList.contains('answer-hyperlink')) {
                vote[voteType] = answer
            } else {
                throw new Error(`Did not the expected HTML class that identifies this row as a question or answer. 
anchor tag: ${anchor.outerHTML}
row: ${row.outerHTML}
`)
            }

            vote[postUrl] = anchor.href

            // todo If it is an answer, extract the upvoted answer link
            console.log({vote})
            votes.push(vote)
        }
    })
    .catch(err => {
        console.log(`Something went wrong: ${err}`)
    })


