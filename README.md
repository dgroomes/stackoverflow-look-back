# stackoverflow-static

NOT YET FULLY IMPLEMENTED

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

## Design

This is a simple JavaScript mash-up that brings some custom JavaScript code into your browser to scrape your own votes
data from your StackOverflow profile page. In a way, it's like a browser extension but the mechanism to load the custom
code is via a dynamic `<script>` tag to load the code from a local web server. There's no need to go through the effort
and ceremony of creating a full-on browser extension. Plus, browser extensions are by definition vendor-specific ([Chrome Extensions](https://support.google.com/chrome_webstore/answer/1047776?hl=en&topic=1212379),
[Firefox add-ons/extensions](https://addons.mozilla.org/en-US/firefox/extensions/), [Safari extensions](https://apps.apple.com/us/story/id1377753262),
[Edge add-ons](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home), [Opera addons/extensions](https://addons.opera.com/en/extensions/)).
Oh wait, there is a [standard browser extensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension)?
Nice! I want to explore this.

## Instructions

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
      el.src = "http://127.0.0.1:8000/scrape-votes.js"
      document.head.append(el)
      ```
1. Expand the post data
    * Go to the [Stack Exchange Data Explorer](https://data.stackexchange.com/stackoverflow/query/new)
    * Import some JavaScript code into the browser from the web server. Paste the following into the browser console:
      ```javascript
      let el = document.createElement("script")
      el.src = "http://127.0.0.1:8000/expand-posts.js"
      document.head.append(el)
      ```
    * TODO
1. TODO

## Reference

* [MDN Web docs: API docs for *NodeList*](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
* [MDN Web docs: API docs for *MutationObserver*](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
* [Meta Stack Exchange: Database schema for the Stack Exchange Data Explorer (SEDE)](https://meta.stackexchange.com/a/2678)
