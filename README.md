# stackoverflow-static

🛠 Scrape a static copy of your own StackOverflow votes data.

## Why?

* I need to quickly browse and re-learn from questions I've up-voted in the past
    * Does StackOverflow already support this? <https://stackoverflow.com> does not have search functionality for posts
      that you've up-voted. By contrast, there is a way to search for posts that you've bookmarked (née favorited) using
      the search option `inbookmarks:mine`. See the search page <https://stackoverflow.com/search> for all search
      options. I've bookmarked 117 posts whereas I've up-voted 1,760 posts! **I want search coverage on my votes** (
      Hello StackOverflow, if you see this, consider this a feature request, or at least, a user experience data point!
      Thank you). Here are some related questions by other people:
        * [*How do I search for posts I've interacted on, with a particular word in
          them?*](https://meta.stackoverflow.com/q/302648)
        * [*Search Q or A's I've upvoted*](https://meta.stackoverflow.com/q/394635)
    * Why scrape the HTML for this data and not get it via
      the [Stack Exchange Data Explorer (SEDE)](https://data.stackexchange.com/)? Unfortunately, up-vote and down-vote
      data is private. It is anonymized in SEDE. The StackOverflow API also does not expose this data. So, it must be
      scraped from the HTML.
* Static content is peaceful
* This is a fun project for me
* I like JavaScript and the browser
    * Why do I like the browser so much? Among other things,
      the [MDN Web Docs](https://developer.mozilla.org/en-US/docs/MDN) are so amazing 🤩⭐️ and make it fun and rewarding
      to develop using Web APIs.

---
**NOTE**:

This was developed on macOS and for my own personal use.

---

## Design & Modes

The overall flow of the tool breaks down like this:

1. Scrape your votes data from <https://stackoverflow.com>
1. Expand the votes data into posts data using <https://data.stackexchange.com>
1. Generate a static HTML page from the posts data

There are two ways–or, *modes*–to use the tool. Choose the mode that you prefer:

* *Chrome extension* mode (NOT YET FULLY IMPLEMENTED)
    * Recommended for Chrome users
* *Manual* mode
    * Manually run the tool by executing commands in the browser developer tools and by manually moving files
    * Recommended for learning
    * This works for any evergreen browser. This mode relies on standard web APIs.

## Instructions

Follow these instructions to install the tool as a Chrome browser extension and use it:

1. Open Chrome's extension settings page
    * Open Chrome to the URL: `chrome://extensions`
1. Enable developer mode
    * Enable the *Developer mode* toggle control in the upper right corner of the page
1. Install the extension
    * Click the *Load unpacked* button
    * In the file finder window that opens, find this directory and click *Select*
    * It's installed!
1. Open StackOverflow
    * Go to <https://stackoverflow.com/> in your browser
1. Log in
1. Open your profile
    * Click your picture in the top right corner to open your profile
1. Open the "Votes" tab
    * Find the "Votes" tab and click it.
    * For me, my Votes tab navigates to this URL: <https://stackoverflow.com/users/1333713/david-groomes?tab=votes>
1. Scrape the votes data
    * Navigate to a page.
    * Click the blue puzzle icon in the top right of the window
    * Click the "stackoverflow-static" extension entry
    * Wait for a second (not sure why it's so slow)
    * Click the "Scrape votes" button
1. DOES NOT WORK Expand the post data
    * Go to the [Stack Exchange Data Explorer](https://data.stackexchange.com/stackoverflow/query/new)
    * Repeat the earlier steps to open the extension entry
    * Click the "Expand posts" button
    * todo
    * The posts data will be downloaded in a file named `stackoverflow-posts.json`
1. Generate HTML
    * todo

Follow these instructions to run the tool the manual way. It requires more steps:

1. Run a local web server:
    * `./serve.py`
    * Note: this requires Python 3
1. Open StackOverflow
    * Go to <https://stackoverflow.com/> in your browser
1. Log in
1. Open your profile
    * Click your picture in the top right corner to open your profile
1. Open the "Votes" tab
    * Find the "Votes" tab and click it.
    * For me, my Votes tab navigates to this URL: <https://stackoverflow.com/users/1333713/david-groomes?tab=votes>
1. Scrape the votes data
    * Import some JavaScript code into the browser from the web server. Paste the following into the browser console:
      ```javascript
      let el = document.createElement("script")
      el.src = "http://127.0.0.1:8000/entrypoint.js"
      document.head.append(el)
      ```
    * The votes data will be downloaded in a file named `stackoverflow-votes.json`
1. Move the votes data
    * Move the downloaded votes data JSON file (`stackoverflow-votes.json`) into the `src/data` directory with the
      following command:
    * `mv ~/Downloads/stackoverflow-votes.json ~/repos/personal/stackoverflow-static/src/data`
    * The data is used in the next step.
1. Expand the post data
    * Go to the [Stack Exchange Data Explorer](https://data.stackexchange.com/stackoverflow/query/new)
    * Import some JavaScript code into the browser from the web server. Paste the following into the browser console:
      ```javascript
      let el = document.createElement("script")
      el.src = "http://127.0.0.1:8000/entrypoint.js"
      document.head.append(el)
      ```
    * The posts data will be downloaded in a file named `stackoverflow-posts.json`
1. Move the posts data
    * Move the downloaded posts data JSON file (`stackoverflow-posts.json`) into the `src/data` directory with the
      following command:
    * `mv ~/Downloads/stackoverflow-posts.json ~/repos/personal/stackoverflow-static/src/data`
    * The data is used in the next step
1. Generate a static HTML document from the posts data
    * Open <http://127.0.0.1:8000/generate-html.html>
    * The downloaded file is the final result! Save it somewhere easily accessible.
    * Known issue: The visual elements in the page break after the 1500th post in Chrome. I think this is because of an
      internal limit on CSS Grid sizes. See the note in
      the [CSS Grid w3 standards page](https://www.w3.org/TR/css-grid-1/#overlarge-grids). It mentions 1500, and 3000
      and when I go to exactly 1501 posts (there will be 2 * 1501 = 3002) the last post doesn't get rendered correctly.
      I think that's the limit. This issue does not happen Safari.

## Wish list

General clean ups, TODOs and things I wish to implement for this project:

* DONE Make an `entrypoint.js` file instead of re-using both `scrape-votes.js` and `expand-posts.js` independently
* DONE Get more re-use out of code. For example, re-use the Votes class between the scrape votes functionality and
  expand posts functionality
* Fix the CSS grid problem
* DONE Get post data for questions that were not up-voted but where there was an up-voted answer to that question. This
  is a common case. I thought it was rare because I assumed that when I upvote an answer that I would have already
  upvoted the question. But this isn't the case. I have a about two hundred of these cases. Also, even if I wanted to
  up-vote the question, some are actually locked! For example, one of the very first things I wanted to search for in my
  SO static data was for how to get the query parameters of the URL from JavaScript. But the question and answer didn't
  show up because I didn't upvote the question, only the answer, and it turns out
  the [question itself is locked](https://stackoverflow.com/q/901115/)!
* IN PROGRESS Create a browser extension for this. The main benefit should be the removal of the manual steps like
  opening three different web pages and moving the downloaded files to different directories.
* Consider creating a search bar where multiple terms can be search at once. Originally, I was hoping `Cmd + F` would be
  good enough for search but when the search term is SQL or bash, a lot of results come up and it's useful to add a
  second search term to reduce the result. This would add quite a bit of code to the page though.
* Consider using modules, but also consider to NOT use modules. Modules are modern, but modules aren't exported in the
  global context therefore we forego the usual luxury of "executing code ad-hoc on the console to our delight". This is
  kind of a major bummer. Also modules can't be imported in web workers in Safari and FireFox so that is also a bummer
  when considering converting this tool to a browser extension.

## Notes

* The Chrome extension development experience is overall pretty good. I imagine it's much better than it was in the early
  years of Chrome. That said, it's difficult to debug the JavaScript code that runs in a service worker (the one defined
  by the `background.service_worker` field in the manifest. I find that 1) When it errors, there are no logs but just the
  infamous "Service worker registration failed" message in the "chrome://extensions" page and 2) I can't attach a debugger.
  The only thing I can do is comment out the whole file, and uncomment lines little by little and adding `console.log`
  statements.
* How many execution contexts are there? 1) The JavaScript execution environment in the page 2) The JavaScript execution
  environment that executes the extension code like the popups and 3) The JavaScrip execution environment that runs the
  content scripts? For example, I need to understand this because I'm hitting a roadblock where I want to make a Proxy over
  jQuery on the webpage, but a content script's execution environment doesn't have access to the web page's variables,
  but it does have access to the DOM (seems arbitrary to allow one but block the other, but there is probably a good
  reason). And there is a way to work around this problem anyway: inject a script element into the page itself from a
  content script. See [this StackOverflow question and answer](https://stackoverflow.com/q/20499994). 

## Reference

* [MDN Web docs: API docs for *NodeList*](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
* [MDN Web docs: API docs for *MutationObserver*](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
* [Meta Stack Exchange: Database schema for the Stack Exchange Data Explorer (SEDE)](https://meta.stackexchange.com/a/2678)
* Multiple references on recommended/possible ways to render HTML dynamically from JS code in the browser (there are
  many but there is not an obvious choice!)
    * [StackOverflow Answer: Use `DOMParser`](https://stackoverflow.com/a/3104237)
    * [StackOverflow Answer: Use `createElement` and extract the `innerHTML`](https://stackoverflow.com/a/3104251)
    * [StackOverflow Answer: Use `insertAdjacentHtml`](https://stackoverflow.com/a/19241659)
    * [StackOverflow Answer: Use `<template>`](https://stackoverflow.com/a/35385518)
    * [StackOverflow Answer: Use `createContextualFragment`](https://stackoverflow.com/a/7326602/1333713)
* [Chrome extensions docs](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
* [MDN Web docs: *JavaScript modules*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
* [MDN Web docs: *toJSON()
  behavior*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
* [`dgroomes/web-playground/browser-extensions`](https://github.com/dgroomes/web-playground/tree/main/browser-extensions)
    * My own reference project for Chrome extensions
