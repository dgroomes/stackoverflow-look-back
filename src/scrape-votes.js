// Scrape your own StackOverflow votes data from your profile page. See the README.

const
    voteType = Symbol('voteType'), // consider using a class to represent vote data instead of symbols.
    question = Symbol('question'),
    postUrl = Symbol('postUrl'),
    answer = Symbol('answer');

let votes = [] // The votes data will be scraped from the HTML and collected as "usefully organized" data objects into this array

console.log("Hello from 'scrape-votes.js!")

/**
 * Scrape the current page of votes data.
 */
function scrapeCurrentPage() {

    // Get all row elements of the "Votes cast" table.
    // Each row represents an up-voted question OR up-voted answer. (Does it include up-voted comments?)
    //
    // Unfortunately, there is no class name attached to the "votes" HTML elements which could clearly identify these
    // elements as "votes". In the absence of this, we can make the query selector more semantic by at least including
    // the "#user-tab-votes" string to convey that we are looking for HTML elements on the "Votes" section of the page
    // and not anywhere else. We can't guarantee that there isn't another HTML table on the page, so specific a query
    // selector is best. UPDATE: all rows have the 'data-postid' attribute so that's pretty expressive.
    let votesRows = document.querySelectorAll('#user-tab-votes tr[data-postid]')

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
        votes.push(vote)
    }
}

scrapeCurrentPage()
console.log(`Found ${votes.length} votes!`)
console.log({votes})
// TODO navigate to the subsequent pages in the Votes tab and scrape the votes data
// document.querySelector('a[rel=next]').click()
