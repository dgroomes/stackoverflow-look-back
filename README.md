# stackoverflow-static

🛠 Scrape a static copy of your own StackOverflow votes data.

## Why?

* I need to quickly browse and re-learn from questions I've up-voted in the past
    * Does StackOverflow already support this? <https://stackoverflow.com> does not have search functionality for posts
      that you've up-voted. By contrast, there is a way to search for posts that you've bookmarked (née favorited) using
      the search option `inbookmarks:mine`. See the search page <https://stackoverflow.com/search> for all search
      options. I've bookmarked 117 posts whereas I've up-voted 1,850 posts! **I want search coverage on my votes** (
      Hello StackOverflow, if you see this, consider this a feature request, or at least, a user experience data point!
      Thank you). Here are some related questions by other people:
        * [*How do I search for posts I've interacted on, with a particular word in
          them?*](https://meta.stackoverflow.com/q/302648)
        * [*Search Q or A's I've upvoted*](https://meta.stackoverflow.com/q/394635)
    * Why *scrape* the HTML for this data and not just *query* it via
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

The overall flow of the tool breaks down like this:

1. Scrape your votes data from <https://stackoverflow.com>
1. Expand the votes data into posts data using <https://data.stackexchange.com>
1. Generate a static HTML page from the posts data

The source code is laid in a directory structure that groups code by the execution context that the code runs in:

* `src/web/`
    * The code in this directory will all be loaded on the web page. This directory might be more accurately named as
      `web-page/`.
* `src/extension/`
    * The directories in this directory are for web extensions. It breaks down into these sub-directories:
        * `common/`
            * The code in this directory gets loaded into the extension environment (background workers, popups, etc) or
              the Content Script environment (an isolated JavaScript environment with access to the web page DOM)
        * `chromium-manifest-v2/`
            * Code that supports a Manifest V2 web extension developed for Chromium browsers.
        * `firefox-manifest-v2/`
            * Code that supports a Manifest V2 web extension developed for Firefox.

      This directory layout is inviting for future additions like Manifest V3 support, or a Safari browser extension.

Note: after trial and error, I've found it difficult or confusing to define common code that gets used in both the web
extension layer and the web page. So, I'm purposely designing the code base to not have any shared common code.

The extension has been verified to work in these browsers:

* [x] Firefox (version 91)
* [x] Chrome (version 92)
* [x] Opera (version 78)

### My Bias Against Content Scripts

In my opinion, content scripts are not compelling and I don't quite get their necessity in browser extension technical
architecture. From my perspective there of course needs to be one isolated JavaScript execution environment that powers
an extension. Why do there need to be two? The extension context has access to powerful browser APIs. The web page
itself is a powerful execution environment because it has access to the DOM and the application source code. So what is
the place of content scripts? I know by design, they have access to the DOM while the extension environment does not.
But why? I'm sure there are good reasons. But the three different exec environments and their unique capabilities and
restrictions has made it difficult to design and implement my own code.

### My Bias for Web APIs

A corollary to my bias against content scripts is my bias for Web APIs. Most of the source code for this extension
actually executes on the web page, where standard Web APIs can be used. This code executes the domain logic like the
data scraping and HTML generation. As such, this code is perfectly portable to other "evergreen" browsers because it
just relies on standard web APIs instead of non-standard browser extension APIs (i.e. Manifest V2 and V3).

## Instructions

Follow these instructions to install the tool as a Chrome browser extension and use it:

1. Open Chrome's extension settings page
    * Open Chrome to the URL: `chrome://extensions`
    * Alternatively, follow the instructions in the [Firefox](#firefox) section below to install the extension in
      Firefox
    * Alternatively, follow the instructions in the [Opera](#opera) section below to install the extension in Opera
1. Enable developer mode
    * Enable the *Developer mode* toggle control in the upper right corner of the page
1. Install the extension
    * Click the *Load unpacked* button
    * In the file finder window that opens, find the directory `src/extension/chromium-manifest-v2` and click *Select*
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
    * Open the extensions menu by pressing the puzzle icon in the top right of the window
        * Alternatively, for Opera, it is a cube button
        * Alternatively, for Firefox, there is NOT an extensions menu and instead you invoke the extension directly by
          clicking a puzzle icon button on the right side of the URL bar.
    * Click the "stackoverflow-static" extension entry
    * A popup will show up with buttons titled "Scrape votes" and "Expand posts". Click "Scrape votes" and check the
      console logs. The votes data will have been scraped and saved to browser storage.
1. Expand the post data
    * Go to the [Stack Exchange Data Explorer](https://data.stackexchange.com/stackoverflow/query/new)
        * If not logged in, then log in and navigate back to the original page.
    * Repeat the earlier steps to open the extension entry
    * The same popup will appear. Click "Expand posts". The post data will be expanded and saved into browser storage.
    * Additionally, a new tab will open.
1. Generate a static HTML document from the posts data
    * You should be on the new tab that was automatically opened
    * A file download will appear! This is the final result. Save it somewhere easily accessible.

## Firefox

Although this tool was developed as a Chrome extension, it can also be installed as a web extension in Firefox!

Follow these instructions to install it in Firefox:

1. Build the web extension for Firefox
    * `./build-for-firefox.sh`
1. Open Firefox to the debug page
    * Open Firefox
    * Paste and go to this URL: <about:debugging#/runtime/this-firefox>
1. Load the plugin
    * Click the button with the words *Load Temporary Add-on…*
    * In the file finder window that opens, find the file `build/firefox-web-extension/manifest.json` and click *Open*
    * It's installed!

## Opera

The extension can also run in [Opera](https://www.opera.com).

Follow these instructions to install it in Opera:

1. Open Opera to the debug page:
    * Open Opera
    * Paste and go to this URL: <opera:extensions>
1. Enable developer mode
    * Toggle on the *Developer mode* control in the top right corner
1. Load the plugin
    * Click the "Load unpacked" button
    * In the file finder window that opens, find the directory `src/extension/chromium-manifest-v2` and click *Select*
    * It's installed!

## Wish List

General clean ups, TODOs and things I wish to implement for this project:

* DONE (implemented for only a single search term) Consider creating a search bar where multiple terms can be search at once. Originally, I was hoping `Cmd + F` would be
  good enough for search but when the search term is SQL or bash, a lot of results come up and it's useful to add a
  second search term to reduce the result. This would add quite a bit of code to the page though.
* Include tags data. This would enable the ability to search by tags too.
* SKIPPED Consider using modules, but also consider to NOT use modules. Modules are modern, but modules aren't exported in the
  global context therefore we forego the usual luxury of "executing code ad-hoc on the console to our delight". This is
  kind of a major bummer. Also modules can't be imported in web workers in Safari and Firefox so that is also a bummer
  when considering converting this tool to a browser extension.
  * This was SKIPPED because even the official Chrome and Firefox repositories of example extensions do not use modules.
    I am following by their "lead by example". See: 
      * <https://github.com/GoogleChrome/chrome-extensions-samples>. Only the "apps" examples use modules but Chrome Apps
        aren't extension. Chrome Apps are deprecated. 
      * <https://github.com/mdn/webextensions-examples>
* IN PROGRESS Consider adding RPC from the extension to the web page. Currently there is only the other way where the extension
  background script is the RPC server and the web page is the RPC client. But the other way would create a needed
  communication channel. Currently, the way that the extension communicates commands to the web page is an awkward "load
  another tiny script on the page" strategy. The many little content scripts and web scripts added to handle the
  dispatch of the "scrape votes" or "expand posts" command is verbose. They include:
    * `content-script-scrape-votes.js`
    * `content-script-expand-posts.js`
    * `web-scrape-votes.js`
    * `web-expand-posts.js`
    * `web-generate-html.js`

  They could all go removed and replaced with an RPC server (listener) that listens for the "scrape votes" or "expand
  posts"
  command from the extension background script.
    * DONE First, start by defining an `RpcServer` interface class and a `BackgroundScriptRpcServer` class. Use the `BackgroundScriptRpcServer`
      in `init-common.js`.
    * Next, define a server on the front-end and a client in the background 

## Finished Wish List items

These are the finished items from the Wish List:

* DONE Make an `entrypoint.js` file instead of re-using both `scrape-votes.js` and `expand-posts.js` independently
* DONE Get more re-use out of code. For example, re-use the Votes class between the scrape votes functionality and
  expand posts functionality
* DONE Get post data for questions that were not up-voted but where there was an up-voted answer to that question. This
  is a common case. I thought it was rare because I assumed that when I upvote an answer that I would have already
  upvoted the question. But this isn't the case. I have a about two hundred of these cases. Also, even if I wanted to
  up-vote the question, some are actually locked! For example, one of the very first things I wanted to search for in my
  SO static data was for how to get the query parameters of the URL from JavaScript. But the question and answer didn't
  show up because I didn't upvote the question, only the answer, and it turns out
  the [question itself is locked](https://stackoverflow.com/q/901115/)!
* DONE Create a browser extension for this. The main benefit should be the removal of the manual steps like opening
  three different web pages and moving the downloaded files to different directories.
* DONE (Update I think it's a race condition with the JavaScript doc load order) There are some occasional caching
  problems. Sometimes when I load a page, it saves "AppStorage" not define and stuff like that. I think it's a caching
  problem because when I "hard reload and empty caches" it works. But then later it might fail again although I haven't
  even changed the code so I don't understand how the cache could still be stale, and thus still be a problem. Not sure.
  But it's annoying.
* DONE Create a Chrome Manifest v2 extension. This would enable making a Firefox extension, which is still on v2 but is
  working on supporting v3 sometime in 2022.
* DONE Build a Firefox extension for the tool. For the most part, code can be re-used, but when it comes to the
  extension APIs themselves, there are significant differences. In fact, porting the extension to Firefox has been one
  of the most challenging software efforts I've done in recent years! In part, because I've been away from JavaScript
  dev for so long but also because the standardization of extension APIs is still a work-in-progress.
* DONE Drop the Manifest V3 implementation. I originally implemented the Chrome extension using the Manifest V3 format
  for the simple reason that the Chrome getting started docs for extension development uses Manifest V3. This was my
  first web extension. Now that I've ported this to Firefox, I know much more about the extension landscape, especially
  the APIs. For example, Firefox is working on Manifest V3 support and it is a large effort which will take until early
  2022 at the earliest. See this related blog post
  at [blog.mozilla.org](https://blog.mozilla.org/addons/2021/05/27/manifest-v3-update/). Firefox will support Manifest
  V2 for at least another year. So that's early 2023 at the earliest. There is no value proposition for me to support a
  Manifest V3 version of the extension today when I can pay that implementation cost when the time comes that Manifest
  V2 support ends. The cost will almost definitely be lower then than now because of the inevitable enrichment of docs,
  StackOverflow posts, etc over time. So, drop the Manifest V3 support. 
* DONE Create an extension HTML page as an alternative to `generate-html.html`. This page will render the post
  data in a similar way but it will stop short of the downloading step. This page is meant to be used as an ephemeral
  view. Why? This is mostly just convenient so that I don't have to download the generated HTML and open it in a new tab
  over and over again while iterating on the UI.
    * DONE Create a browser action to open the "generate-html.html" page
        * DONE (only implemented "Scrape" and "Expand") Because web extensions are only allowed one UI control in the
          browser, we can't just add a new button to implement this feature. Instead, we need to extend
          the `execute.html` page and remove its "automatic action detection based on URL" logic and replace it with
          explicitly "Scrape Votes", "Expand Post Data", "View", and
          "Download" buttons. This was actually the original implementation a long while back so I can copy from the
          original code.
    * ABANDONED (Something strange is up with the extension styles, there's some injected CSS I don't know where it's coming from) Fix the styles
    * ABANDONED (Chrome only allows either a browser action or page actions, but not both. Oh well. I've figured out I can just bookmark the extension HTML page which works great.). Allow the extension to show the "View posts" button from any page. This should be a "browser action" instead of a
      "page action" (I'm so glad I dropped the Manifest V3 support because then I'd have to solve for the unified
      actions way too).
* DONE (Although this is a memory hog) Fix the CSS grid problem
* DONE Known issue: The visual elements in the page break after the 1500th post in Chrome. I think this is because of an
  internal limit on CSS Grid sizes. See the note in
  the [CSS Grid w3 standards page](https://www.w3.org/TR/css-grid-1/#overlarge-grids). It mentions 1500, and 3000 and
  when I go to exactly 1501 posts (there will be 2 * 1501 = 3002) the last post doesn't get rendered correctly. I think
  that's the limit. This issue does not happen Safari.

## Notes

* The Chrome extension development experience is overall pretty good. I imagine it's much better than it was in the
  early years of Chrome. That said, it's difficult to debug the JavaScript code that runs in a service worker (the one
  defined by the `background.service_worker` field in the manifest. I find that 1) When it errors, there are no logs but
  just the infamous "Service worker registration failed" message in the "chrome://extensions" page and 2) I can't attach
  a debugger. The only thing I can do is comment out the whole file, and uncomment lines little by little and
  adding `console.log`
  statements.
* How many execution contexts are there? 1) The JavaScript execution environment in the page 2) The JavaScript execution
  environment that executes the extension code like the popups and 3) The JavaScrip execution environment that runs the
  content scripts? For example, I need to understand this because I'm hitting a roadblock where I want to make a Proxy
  over jQuery on the webpage, but a content script's execution environment doesn't have access to the web page's
  variables, but it does have access to the DOM (seems arbitrary to allow one but block the other, but there is probably
  a good reason). And there is a way to work around this problem anyway: inject a script element into the page itself
  from a content script. See [this StackOverflow question and answer](https://stackoverflow.com/q/20499994).
* The `let that = this` trick I have to use in the ES6 classes is a bit disappointing... how else could this code be
  designed? Is there an idiomatic ES6 class way? Or this a quirk of classes?
* One of the significant changes of Chrome's Manifest V3 over Manifest V2 is
  the [Action API unification](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#action-api-unification)
  .

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
* [Chrome extension docs: *chrome.webRequest*](https://developer.chrome.com/docs/extensions/reference/webRequest/)
    * Consider using this API to intercept requests instead of using a Proxy object on the web page
* [Firefox Extension Workshop: *Porting a Google Chrome
  extension*](https://extensionworkshop.com/documentation/develop/porting-a-google-chrome-extension/)
    * Shoot, Firefox doesn't support Manifest v3 and I spent all this time writing a Chrome extension in Manifest v3. I
      wish I had implemented in Manifest v2 so that I could compatibility with Firefox.
* [Chrome extension docs: Manifest V2 *Getting started*](https://developer.chrome.com/docs/extensions/mv2/getstarted/)
* [MDN Web docs: "page_action"](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/page_action)
    * Note that the Manifest property `show_matches` (of `page_actions`) is only supported in Firefox. By default, page
      actions are hidden in Firefox but by contrast, page actions are shown by default in other browsers. This was a
      surprising find to me because I couldn't see the page action in the URL bar and I was confused! I need to
      explicitly enable it with the `show_matches` property.
* [Extension Workshop](https://extensionworkshop.com/documentation/develop/debugging/#developer-tools-toolbox)
    * A special Firefox site that is focused entirely on extension development.
    * > Get help creating and publishing Firefox add-ons that make browsing smarter, safer, and faster.
* [Bugzilla (Firefox bug tracker)](https://bugzilla.mozilla.org/show_bug.cgi?id=1420286)
    * You can't use symlinks in web extensions. This works in Chrome, so this type of issue wasn't on my radar and I
      spent a lot of time trying to track this issue down. I wonder if symlinks might work in Firefox Development
      version? Update: no, it is the same in Firefox Developer edition.
* [GitHub repo: mozilla/web-ext](https://github.com/mozilla/web-ext)
    * I'm purposely choosing to not use this tool. I want to keep the dependencies to an absolute minimum and this tool
      is not critical.
* [MDN Web Docs: Manifest property "externally_connectable"](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable)
    * The `externally_connectable` is not supported in Firefox. An alternative must be used for message passing between
      the web page and the extension.
      See <https://github.com/mdn/webextensions-examples/tree/master/page-to-extension-messaging>.
* [MDN Web Docs: the EventTarget APIs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
* [MDN Web Docs: Window postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
* [MDN Web Docs: runtime.sendMessage()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage)
* [Opera dev docs: *The Basics of Making an Extension*](https://dev.opera.com/extensions/basics/)
* [MDN Web Docs: browserAction.onClicked](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/onClicked)
* [Chrome extension docs: *chrome.browserAction*](https://developer.chrome.com/docs/extensions/reference/browserAction/)
