// Scrape your own StackOverflow votes data from your profile page. See the README.
console.log("Hello from 'scrape-votes.js!")

/**
 * This is a data class that represents a StackOverflow vote.
 */
class Vote {

    /**
     * @param postType the type of post that the vote was for. Either "question" or "answer"
     * @param postUrl the URL of the post
     * @param postId the ID of the post
     */
    constructor(postType, postUrl, postId) {
        this.postType = postType
        this.postUrl = postUrl
        this.postId = postId
    }
}

let votes = [] // The votes data will be scraped from the HTML and collected into this array as instances of the "Vote" class

// Get a handle on the "Votes tab" HTML element
let votesTab = document.getElementById("user-tab-votes")

/**
 * Scrape the current page of votes data.
 */
function scrapeCurrentPage() {

    // Get all row elements of the "Votes cast" table.
    //
    // Each row represents an up-voted question OR up-voted answer. (Does it include up-voted comments?). All rows have
    // the 'data-postid' attribute so we can query using that fact.
    let votesRows = votesTab.querySelectorAll('tr[data-postid]')

    // Extract the data from each vote row HTML element.
    //
    // Note that each row will either be an up-voted question or up-voted answer:
    // * Answer rows will always have an anchor tag ('a') with a class named "answer-hyperlink"
    // * Question rows will always have an anchor tag ('a') with a class named "question-hyperlink"
    for (let row of votesRows) {

        // All rows will have an anchor tag which links to the up-voted post. This anchor tag is always inside of a
        // 'b' tag.
        let anchor = row.querySelector('b a')

        let postUrl = anchor.href;
        let postType
        let postId
        if (anchor.classList.contains('question-hyperlink')) {
            postType = "question"

            // Extract the question ID from the URL. The question ID is always after the "questions/" part in the URL.
            // For example, 54189630 is the ID in the below URL:
            // https://stackoverflow.com/questions/54189630/kill-all-gradle-daemons-regardless-version
            let match = /questions\/(?<id>\d+)/.exec(postUrl)

            postId = match.groups.id
        } else if (anchor.classList.contains('answer-hyperlink')) {
            postType = "answer"

            // Extract the answer ID from the URL. The answer ID is at the end of the URL.
            // For example, 28358529 is the ID in the below URL:
            // https://stackoverflow.com/questions/28351294/postgres-finding-max-value-in-an-int-array/28358529#28358529
            let match = /\d+$/.exec(postUrl)

            postId = match[0]
        } else {
            throw new Error(`Did not the expected HTML class that identifies this row as a question or answer. 
anchor tag: ${anchor.outerHTML}
row: ${row.outerHTML}
`)
        }

        let vote = new Vote(postType, postUrl, postId)

        votes.push(vote)
    }
    console.log(`Found ${votes.length} total votes!`)
}

// Navigate to the subsequent pages in the Votes tab and scrape the votes data.
// How? There's a pretty neat trick we can do. Navigate to the next page in the votes tab. Observe when the HTML contents
// of the votes changes and then trigger the scraping procedure again. Rinse and repeat.

/**
 * Navigate to the next page in the votes tab. This function is instrumented with a volume limiter so that we don't
 * accidentally trigger a barrage of page loads due to programming error.
 */
{
    const limit = 100
    let attempts = 0

    function nextVotesPage() {
        if (++attempts > limit) {
            console.info(`The limit has been reached for 'next page' attempts. limit=${limit} attempts=${attempts}`)
            downloadVotesData()
            return
        }

        let el = document.querySelector('a[rel=next]');
        if (el === null) {
            console.log("All pages of the votes tab have been visited. Downloading the votes data to a JSON file...")
            downloadVotesData()
            return
        }

        el.click()
    }
}

let observer = new MutationObserver(function (mutations) {
    for (let mutation of mutations) {
        if (!votesTab.isConnected) {
            // The votes tab was disconnected! It must have been replaced by a new.
            votesTab = document.getElementById("user-tab-votes")
            scrapeCurrentPage()
            setTimeout(nextVotesPage, 1000) // Trigger the next votes page, but with rate limiting
            return
        }
    }
})

observer.observe(document, {
    subtree: true, // Monitor all sub-elements (children, children of children, etc) for mutations
    childList: true, // Monitor for the addition and removal of elements on the target element,
})

scrapeCurrentPage()
nextVotesPage()

/**
 * Download the votes data as a JSON file.
 *
 * This uses a feature called Data URLs (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
 */
function downloadVotesData() {
    let votesJson = JSON.stringify(votes, null, 2)
    let votesEncoded = encodeURIComponent(votesJson)

    let el = document.createElement('a')
    el.setAttribute('href', `data:application/json,${votesEncoded}`)
    el.setAttribute('download', "stackoverflow-votes.json")
    el.click()
}
