# StackOverflow *Look Back Tool*

🛠 Extract and search the posts you've up-voted on StackOverflow. ***Look back*** on your data.

---

I need to quickly browse and re-learn from questions I've up-voted in the past. This is a browser extension for doing
that. See [Background](#background) for more information.

**NOTE**: This was developed on macOS and for my own personal use.

## Design

The overall flow of the tool breaks down like this:

1. Scrape your votes data from <https://stackoverflow.com>
1. Expand the votes data into posts data using <https://data.stackexchange.com>
1. View and search a copy of the posts data

The source code is generally grouped by the execution context that the code runs in and is inviting for future additions
like Manifest V3 support, or a Safari browser extension.

* `util/`
    * Miscellaneous utility code that is not specific to the *Look Back Tool*. 
* `src/`
    * The code in this directory is specific to the *Look Back Tool*. 
* `src/web-page/`
    * The code in this directory runs on the web page.
* `src/backend/`
    * The code in this directory runs in the extension *backend* contexts: background workers, popups, and content
      scripts.
* `src/chromium-manifest-v2/`
    * Code that supports a Manifest V2 web extension developed for Chromium browsers.
* `src/firefox-manifest-v2/`
    * Code that supports a Manifest V2 web extension developed for Firefox.

There is one library dependency for the project: <https://github.com/dgroomes/web-extension-framework>. The *web-extension-framework*
is an RPC-centric web extension framework that was originally developed as part of the *Look Back Tool* codebase.

The extension has been verified to work in the checked `[x]` browsers:

* [x] Firefox (version 91)
* [x] Chrome (version 92)
* [x] Opera (version 78)
* [ ] Edge
* [ ] Safari

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

### Browser Extension RPC Framework

A significant portion of a non-trivial web extension is often dedicated to *Message Passing* between the four components
of an extension: (1) a background script (2) a popup script (3) a content script (4) the web page. Message passing is a
fundamental and useful programming feature, but unfortunately in a web extension environment the complexity of the code
for message passing is exacerbated by the number of components (the aforementioned four) and the sometimes stark
differences in APIs between browsers (Chromium vs Firefox). It's desirable to encapsulate the complexity of message
passing behind an easy-to-use API that takes a message, does all of the behind the scenes work, and then returns a
response. This description looks like a *Remote Procedure Call* system.

In this codebase, I've implemented a general-purpose Remote Procedure Call (RPC) API for web extensions.

It could be extracted into it's own project. And honestly, it's not a great implementation, but I came to it out of
necessity.

The source code is laid out in a file structure that groups code by the execution context that the code runs in:

* `rpc-framework/rpc.js`
    * The code in this file is foundational common code for the RPC framework. It is used in all contexts of a web
      extension: background scripts, popup scripts, content scripts, and the web page.
* `rpc-framework/rpc-web-page.js`
    * The code in this file runs on the web page.
* `rpc-framework/rpc-backend.js/`
    * The code in this file runs in the extension *backend* contexts: background workers, popups, and content scripts.
* `rpc-framework/content-script.js`
    * The code in this file runs in a content script.

One thing I'm omitting with the RPC implementation is an "absolute unique identifier" to associate with each message.
Without this uniqueness, it's potentially possible to "cross beams" and, for example, have an RPC client process a
message that was not intended for it. I think this is virtually impossible though because we are in a browser
environment where we exercise almost complete control of the environment. By contrast, an RPC system in a distributed
system spanning different networks would need to handle these cases.

#### RPC Framework Usage Instructions

Browser extensions that use the RPC Framework must follow these steps to depend on and initialize the framework in the
extension and web page contexts:

1. Manifest changes
    * Unless you are bundling the RPC code directly into a final `bundle.js`-like file, then you must make these files
      accessible. The `manifest.json` file must allow access to the RPC JavaScript source code files as needed.
      Specifically, `rpc.js`, and `rpc-backend.js` must be added to the background scripts and `rpc.js`
      and `rpc-web-page.js` must be added to the web page.
1. Initialize configuration in the background
    * The background script must invoke `initRpcBackground(...)`
1. Load the content scripts
    * The content script `rpc-content-script.js` must be executed.
1. Initialize objects in the web page
    * The web page must initialize the RPC objects on the web page by calling `initRpcWebPage(...)`

## Web Extension Framework

`web-extension-framework/` is an RPC-centric web extension framework.

Here are some key points:

* It supports Manifest V2 APIs only (Manifest V3 APIs are not supported)
* It is useful for injecting JavaScript files into the web page
* It is useful for two-way communication between components. E.g. web-page-to-background, popup-to-background, etc.
* It depends on `rpc-framework/`
* If you do not need to inject JavaScript code into the web page, then you probably don't need this framework.
* This framework only supports injecting one JavaScript file into the web page. This is because of the implementation
  detail around the hardcoded "page-script-satisfied" signal. It could be made dynamic with more complexity but I don't
  need that.

The API is complicated only because the architecture of a web extension can be complicated. Some extensions will use all
JavaScript execution environments: background scripts, popup scripts, content scripts and web page scripts. It's
challenging conceptually to even think about all these environments because we are used to programming in just one
environment like the web page, or maybe a NodeJS app. Plus, writing a program for this environment requires a lot of
message passing code, Promises code and logging (for debugging) code. That's where `web-extension-framework/` comes in.

However, the framework cannot abstract away the JavaScript execution environments. The user of the API still needs to
know how web extensions work and about each of the Java execution environments. In that sense, this API does not offer
a strong abstraction but rather a *leaky abstration*. To make up for this, the framework offers block-level API
documentation, design notes and inline code comments. The framework code is meant to be read. Please study it before
using it!

The API is best introduced by way of example. Suppose we are developing a *Detect Code Libraries* (DCL) web extension
using `web-extension-framework/`. This extension adds code to the web page to detect what JavaScript libraries are loaded,
like jQuery, React, Vue, Lodash, etc. The "detected libraries" data is sent from the web page back to the extension
background script and saved into Web Storage where the user can later browse the data. Now, consider how the
detection feature must be implemented. JavaScript must be injected into the web page so that it may look for global
variables like `jQuery` and `React`. Injecting JavaScript code into the web page can only be done from a content script.
And injecting a content script must be done from a background or popup script! Phew, that's a lot of JavaScript execution
environments. Keep in mind these components:

1) The DCL background script
    * `dcl-background-script.js`
2) The DCL content script
    * `dcl-content-script.js`
3) The DCL web page script
    * `dcl-page-script.js`

The programmer must write each of these files. It is not possible for `web-extension-framework` to abstract away
`dcl-content-script.js` or `dcl-page-script.js`. Abstracting away those files would require dynamic JavaScript,
serializing/deserializing JavaScript code, and using `eval()`, which we are not willing to do.

So, the API of `web-extension-framework/` requires the programmer to still write all of these files but offers functions
to reduce the boilerplate and handle message passing and lifecycle timing.

## Instructions

Follow these instructions to install the tool as a Chrome browser extension and use it:

1. Build the extension distributions:
    * `./build.sh`
1. Open Chrome's extension settings page
    * Open Chrome to the URL: `chrome://extensions`
    * Alternatively, follow the instructions in the [Firefox](#firefox) section below to install the extension in
      Firefox
    * Alternatively, follow the instructions in the [Opera](#opera) section below to install the extension in Opera
1. Enable developer mode
    * Enable the *Developer mode* toggle control in the upper right corner of the page
1. Install the extension
    * Click the *Load unpacked* button
    * In the file finder window that opens, find the extension distribution
      directory `build/chromium-manifest-v2-web-extension/`, single click it to highlight it, and click the *Select*
      button.
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
    * Click the "stackoverflow-look-back" extension entry
    * A popup will show up with buttons titled "Scrape votes" and "Expand posts". Click "Scrape votes" and check the
      console logs. The votes data will have been scraped and saved to browser storage.
1. Expand the post data
    * Go to the [Stack Exchange Data Explorer](https://data.stackexchange.com/stackoverflow/query/new)
        * If not logged in, then log in and navigate back to the original page.
    * Repeat the earlier steps to open the extension entry
    * The same popup will appear. Click "Expand posts". The post data will be expanded and saved into browser storage.
1. View the posts
    * While on the same StackExchange page, repeat the earlier steps to open the extension entry
    * Click the "View posts" button
    * Explore the data!

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
    * In the file finder window that opens, find the file `build/firefox-manifest-v2-web-extension/manifest.json` and
      click *Open*
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

* [ ] IN PROGRESS The web-extension-framework and rpc-framework should be migrated to their own repo. I will be very happy
  when I can remove all of that code from this repo and focus again on the Look Back Tool features!
  * DONE Add code to a new repo: <https://github.com/dgroomes/web-extension-framework>
  * DONE Delete the now redundant framework code
  * Depend on the new code as a Git sub-module
* [ ] Support the Edge browser. Write a Powershell script to build the extension distributions. This is the Windows friendly
  thing to do. Add instructions as needed.
* [ ] Multi-term search. The search bar should take each word and apply an "AND" search
* [ ] Implement a "recents" feature? Maybe the most relevant StackOverflow posts are the ones I just added! I'm revisiting
  them continually until I understand them (concepts) or memorize them (commands or code snippets).

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
* DONE Create an extension HTML page as an alternative to `generate-html.html`. This page will render the post data in a
  similar way but it will stop short of the downloading step. This page is meant to be used as an ephemeral view. Why?
  This is mostly just convenient so that I don't have to download the generated HTML and open it in a new tab over and
  over again while iterating on the UI.
    * DONE Create a browser action to open the "generate-html.html" page
        * DONE (only implemented "Scrape" and "Expand") Because web extensions are only allowed one UI control in the
          browser, we can't just add a new button to implement this feature. Instead, we need to extend
          the `execute.html` page and remove its "automatic action detection based on URL" logic and replace it with
          explicitly "Scrape Votes", "Expand Post Data", "View", and
          "Download" buttons. This was actually the original implementation a long while back so I can copy from the
          original code.
    * ABANDONED (Something strange is up with the extension styles, there's some injected CSS I don't know where it's
      coming from) Fix the styles
    * ABANDONED (Chrome only allows either a browser action or page actions, but not both. Oh well. I've figured out I
      can just bookmark the extension HTML page which works great.). Allow the extension to show the "View posts" button
      from any page. This should be a "browser action" instead of a
      "page action" (I'm so glad I dropped the Manifest V3 support because then I'd have to solve for the unified
      actions way too).
* DONE (Although this is a memory hog) Fix the CSS grid problem
* DONE Known issue: The visual elements in the page break after the 1500th post in Chrome. I think this is because of an
  internal limit on CSS Grid sizes. See the note in
  the [CSS Grid w3 standards page](https://www.w3.org/TR/css-grid-1/#overlarge-grids). It mentions 1500, and 3000 and
  when I go to exactly 1501 posts (there will be 2 * 1501 = 3002) the last post doesn't get rendered correctly. I think
  that's the limit. This issue does not happen Safari.
* DONE (implemented for only a single search term) Consider creating a search bar where multiple terms can be search at
  once. Originally, I was hoping `Cmd + F` would be good enough for search but when the search term is SQL or bash, a
  lot of results come up and it's useful to add a second search term to reduce the result. This would add quite a bit of
  code to the page though.
* Include tags data. This would enable the ability to search by tags too.
* SKIPPED Consider using modules, but also consider to NOT use modules. Modules are modern, but modules aren't exported
  in the global context therefore we forego the usual luxury of "executing code ad-hoc on the console to our delight".
  This is kind of a major bummer. Also modules can't be imported in web workers in Safari and Firefox so that is also a
  bummer when considering converting this tool to a browser extension.
    * This was SKIPPED because even the official Chrome and Firefox repositories of example extensions do not use
      modules. I am following by their "lead by example". See:
        * <https://github.com/GoogleChrome/chrome-extensions-samples>. Only the "apps" examples use modules but Chrome
          Apps aren't extension. Chrome Apps are deprecated.
        * <https://github.com/mdn/webextensions-examples>
* DONE Use info and debug log levels. I think Firefox and Chrome now have good filtering for that in the dev console so
  it's pretty useful
* DONE Remove the automatic trigger of opening the `generate-html.html` page after the post data is expanded and instead
  go to an only on-demand trigger for this, a la the "View posts" button. This is symmetric to the way we trigger "
  Scrape votes"
  and "Expand posts". This is useful for a technical constraint: it's hard to implement a
  request-request-response-response system when it comes to: 1) trigger "Expand posts" from the extension to
  the `content-script-messaging-proxy.js` 2)
  forward the "Expand posts" trigger to the web page 3) execute and wait for the response
  from `PostExpander.expandPosts`
  and return the response to the content script and finally 4) the content script returns the response to the extension
* DONE Solidify on a "Posts viewer" name for the `generate-html.html` (do all the code renaming) and create a "download"
  option as a button on this page.
* DONE Consider adding RPC from the extension to the web page. Currently there is only the other way where the extension
  background script is the RPC server and the web page is the RPC client. But the other way would create a needed
  communication channel. Currently, the way that the extension communicates commands to the web page is an awkward "load
  another tiny script on the page" strategy. The many little content scripts and web scripts added to handle the
  dispatch of the "scrape votes" or "expand posts" command is verbose. They include:
    * (DONE Converted to RPC) `content-script-scrape-votes.js`
    * (DONE Converted to RPC) `content-script-expand-posts.js`
    * (DONE Converted to RPC) `web-scrape-votes.js`
    * (DONE Converted to RPC) `web-expand-posts.js`

  They could all go removed and replaced with an RPC server (listener) that listens for the "scrape votes" or "expand
  posts"
  command from the extension background script.
    * DONE First, start by defining an `RpcServer` interface class and a `BackgroundScriptRpcServer` class. Use
      the `BackgroundScriptRpcServer`
      in `init-common.js`.
    * DONE Next, define a server on the front-end and a client in the background. This is a bit abstract so I need to
      gather my thoughts. Consider the *direction-specific* messaging channels that already exist:
        * From web page to background scripts (Chrome; `ChromiumRpcClient.js` `ChromiumBackgroundScriptRpcServer.js`)
        * From web page to content scripts (Firefox; `FirefoxRpcClient.js` to `content-script-messaging-proxy.js`)
        * From content script to background (Firefox; `content-script-messaging-proxy.js`
          to `FirefoxBackgroundScriptRpcServer.js`)

      The stumbling block that I'll run into when developing a "background to front-end communication channel" is I
      think the only way to "listen" for messages from the web page is via a `window.addEventListener` listener.
      Chrome's extension APIs allow a web page to *send* messages to the extension messaging system
      via `chrome.runtime.sendMessage`
      but I don't think there is a similar API to listen for messages. Instead we must resort to listening to the window
      object. And this design requires that we have a messaging component in a content script because content scripts
      have have access to the window while the background scripts do not. Long story short, we need to
      incorporate `content-script-messaging-proxy.js`
      into our Chromium design (before, it was just for Firefox) and then extend `content-script-messaging-proxy.js` to
      handle both directions. It should transfer messages from the web page to the background scripts and it should do
      the reverse: transfer messages from the background scripts to the web page.
        * DONE Prototype a "server to front-end" RPC for Firefox. Why Firefox? Because it already incorporates the
          `content-script-messaging-proxy.js` so it will be easier. And if the prototype works, there's a much clearer
          path for a general implementation and/or a Chromium implementation.
* DONE Standardize on RPC class naming convention.
    * For clients, the name should follow: 1) BrowserDescriptor 2) SourceDescription 3) DestinationDescriptor 4) "
      RpcClient"
    * For servers, the name should follow: 1) BrowserDescriptor 2) DestinationDescriptor 3) "RpcServer".
      The class comments should follow the same order.
* DONE Consider turning `content-script-messaging-proxy.js` into a specific component of the RPC system. The genericness
  of it is becoming more confusing I think. This work will include baking in the "procedure target RPC" in the RpcClient
  and RpcServer classes and also handling it in the content script proxy.
* DONE Consider how to move the generic RPC code in `extension-entrypoint.js` and the generic RPC code in
  `web-load-source.js` into the `src/rpc/` directory. Ideally, all generic RPC code should live separately from the
  other code. It should be such that the RPC framework is good enough to use by even another project!
* DONE Get rid of the symlinks. It doesn't work on Windows. I think I need a build script, like the Firefox build
  script. It be should be pretty easy to make a Windows bat script or maybe Powershell.
* DONE Embed the "browserDescriptor" into the RPC Framework so that it may use it to instantiate the correct concrete
  sub-classes of RpcServer and RpcClient. Because there are multiple contexts (background, popup, content script, and
  web page), I think its useful to save the browserDescriptor in storage.
    * DONE Create an `rpc-background-init.js` file. This should have a function to take the browserDescriptor as a
      parameter and save it to storage with some name like "rpc-browser-descriptor". The "rpc-" prefix should be used as
      a convention to make it clear that this property is owned and operated by the RPC framework and not by the app
      code. There should be another function to instantiate the `BackgroundToContentScriptRpcClient`. This would be a "
      factory" function. I assume there will be a Chromium-specific and Firefox-specific versions of this client in the
      near future.
        * DONE Create an `rpc-storage.js` file that has functions to get and save the browserDescriptor
* DONE Send a response from the web page RPC server to the popup client. With this feature, it enables the popup to give
  feedback in the UI, like "Scraping..." and "120 votes scraped so far...". There won't be as much a need to open the
  dev tools anymore to verify if it the tool is working or not.
    * DONE Implement for Chrome.
    * DONE Implement for Firefox
* DONE There is no need to fetch the votes page limit from the web page. It can be passed as an argument of the remote
  procedure call from the background.
* DONE Clean up the References. Organize MDN links together.
* DONE Remove the 'votesPageLimit' from storage and instead use an input box in the extension popup. The storage is not
  worth the code complexity. Plus the feature is not even really useful. Might as well remove the code and make the
  limit even more obvious by putting it right next to the "Scrape votes" button. This removes the discovery problem for
  that config.
* DONE Tags. Add question tags to the data and to the UI. Sometimes, a question does not actually contain the relevant concept.
  For example, a question like "How to get the current time in seconds" with the tag "JavaScript" would not show up if
  you search "JavaScript", but I want it to show up.
    * DONE. Get a working SQL query that returns tags. Is it an array type in SQL?
    * DONE Update the sede.ddl
    * DONE Update the SQL query. Update the Post type. Persist the data. Query back the data.
    * DONE Visualize the tags in the UI
    * DONE on tags.
* ABANDONED (Possible, but not feasible) Fix static download. It doesn't include the JavaScript code. The search doesn't work.
    * ABANDONED (Abandoned because Chrome extension by default do not allow any inline `<script>` tags for security. See this [answer](https://stackoverflow.com/a/16153913/)) Yikes, this is a bit involved. There's a fundamental issue which is that you can't just extract the contents of the
      `<script src="...">` tags and paste it into the page as an inline `<script>` tag. You basically do this with CSS which
      is awesome, but it won't work the same for JavaScript as [explained here](https://stackoverflow.com/a/48403181)
      because of the same origin policy. I don't really want to do the technique described in the linked StackOverflow answer.
      How can I get what I want and not introduce too much complexity (or even reduce complexity)... I think I can inline
      the contents `posts.viewer.js`, `PostsViewer.js` and `posts-viewer.css` into `posts-viewer.html`. In other words,
      get rid of those files and just use `posts-viewer.html`. This way, `posts-viewer.html` is already much closer to the
      "Download-ready format" we need to support the download button. Nice.
    * Re-download the external source and splice it into the page. This is the complicated solution that we must do because
      of the restriction described in the earlier item.
    * Delete the `<script src="...">` tags. These should not be included in the download. The downloaded file has to be
      completely static, no external dependencies can be downloaded at runtime.
* DONE Bundle JavaScript source code with Deno. Deno let's us write TypeScript!
    * What is the first minimal step in incorporating Deno? I think we want to use Deno's `bundle` command to create a
      bundled entrypoint JavaScript. But on the other hand, I've discovered that it's inconvenient in general to use
      modules in a browser extension context. So, I'm not sure... Can the `init.js` file be bundled?
        * Update: we want to use ES modules for authoring code but not at runtime because of the aforementioned awkwardness
          of the support for modules in a browser extension context. Deno's bundle let's us concatenate the content of JS
          files that use `import`/`export` into a "bundles" file that does not include `import`/`export`. Perfect.
    * DONE One-by-one modularize the files marked as accessible in the `manifest.json` file. Only entrypoint-type files should
      exist by the end, like `init.js`, `popup.js` and `posts-viewer.js`.
        * DONE Modularize `rpc-web-page.js`
        * DONE Modularize `rpc.js`
        * DONE Modularize `jquery-proxy.js`
        * DONE Modularize everything
    * DONE fix modularization. The `Vote` class is getting double declared. I need to bundle `web-load-source.js`
      into the other web entrypoint files like `posts-viewer.js`
    * DONE Convert something to TypeScript
    * DONE convert more things to TypeScript
        * DONE `posts-viewer.js`
        * DONE `content-script-load-source.js`
        * DONE `popup.js`
    * ANSWERED How do source maps work with TypeScript/Deno? Can I still productively debug my code in Chrome Dev Tools?.
      Answer: `deno bundle ...` does not support sourcemaps but it is an [open issue](https://github.com/denoland/deno/issues/8577)
      with a show of support from the Deno core team.
* DONE Fix the sort order of Q&As in the viewer. I'm seeing questions all bunched together and then answers bunched together right
  afterwards. Questions should always be following by their answers, but this isn't happening. For example, [this answer](https://stackoverflow.com/questions/37920923/how-to-check-whether-kafka-server-is-running/49852168#49852168)
  is not following its question.
    * (Answer: yes the "questionId" is a non-normal field and needed be included in the toJSON) Is there a defect where the question ID field is null on answers? For example, answer 37943159 has a null question ID.
      Why? This is a problem for the sort order.
* DONE Change the project name. Drop the "static" name and replace it with "extractor", or "viewer" or something like
  that.
* DONE Defect. If you click the extension button more than once, it is problematic because it runs the content scripts
  every time, which mean multiple window listeners are added because of `content-script-messaging-proxy.js`.
    * DONE When the popup is opened multiple times, the content scripts must skip the "load source" and "initialize RPC
      proxy"
      work. Use a flag on the `window` to keep track of the state.
    * DONE There is some other issue where if you execute "Scrape votes" multiple times, it just grows. Some old objects
      stay around. So when you execute it a second time, it kicks off two scrapers. And when you execute a third time,
      it kicks off three!
* DONE Convert everything to TypeScript
    * DONE Convert the `init.js` files to TypeScript
    * DONE Convert `rpc-backend.js` to TypeScript
    * DONE Convert all of the RPC framework to TypeScript
    * DONE Convert web page stuff to TypeScript
* OBSOLETE (now that TypeScript is in the picture, it is a strong counter force to this problem) This project has ballooned and I could really use some ESLint or something to do the undifferentiated heavy lifting of
  finding basic problems. For example, I changed the signature of the RPC client, and it's pretty easy to miss a call
  site and update the args.
* [x] DONE Modularize the source code layout. I want the `rpc/` code far away from the other code, so it's clear that it is
  a standalone component. Similarly, I want a `core/` component which is the core of the SO Look Back Tool and it
  should be far away from the vendor-specific code (stuff like web extension IDs and manifests)
* [x] DONE (It's not perfect, it should exit earlier. But I don't want to deal with Bash traps/catch yet) Fix the `build.sh` script to not exit when TypeScript compilation fails when the `--watch` option is used
* [x] DONE Clean up the relationship between `web-load-source.ts`, `posts-viewer.ts`, `web-injected.ts` and `content-script-bootstrapper.ts`.
    * This work depends on the completion of the `web-extension-framework/`.
* [x] DONE implement the `web-extension-framework`
    * DONE incorporate the `rpc-framework` into the `web-extension-framework`
    * Note: I am not consistent with the way I separate or fail to separate "this is for the web page" with
      "this is for a popup script". Sometimes I say, "this is for the web page and nothing else", but really it can be
      for a popup script too because a popup script has its own web page (sort of... it has a page-like thing...).
* [x] DONE Create a `BackendWiring` abstraction similar to `PageWiring`

## Background

Here is some background on this project and some of my research which contextualizes the "why" of this project.

* Does StackOverflow already support this? [stackoverflow.com](https://stackoverflow.com) does not have search functionality for posts
  that you've up-voted. By contrast, there is a way to search for posts that you've bookmarked (née favorited) using
  the search option `inbookmarks:mine`. See the search page <https://stackoverflow.com/search> for all search
  options. I've bookmarked 117 posts whereas I've up-voted 1,850 posts! **I want search coverage on my votes** (
  Hello StackOverflow, if you see this, consider this a feature request, or at least, a user experience data point!
  Thank you). Here are some related questions by other people:
    * ["How do I search for posts I've interacted on, with a particular word in them?"](https://meta.stackoverflow.com/q/302648)
    * [*Search Q or A's I've upvoted*](https://meta.stackoverflow.com/q/394635)
* Why *scrape* the HTML for this data and not just *query* it via
  the [Stack Exchange Data Explorer (SEDE)](https://data.stackexchange.com/)? Unfortunately, up-vote and down-vote
  data is private. It is anonymized in SEDE. The StackOverflow API also does not expose this data. So, it must be
  scraped from the HTML.
* This is a fun project for me
* I like JavaScript and the browser
    * Why do I like the browser so much? Among other things,
      the [MDN Web Docs](https://developer.mozilla.org/en-US/docs/MDN) are so amazing 🤩⭐️ and make it fun and rewarding
      to develop using Web APIs.
* This is a vehicle for me to learn TypeScript on a non-trivial project. I'm learning TypeScript with the help of Deno
  and its `bundle` command.


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
  designed? Is there an idiomatic ES6 class way? Or this a quirk of classes? Answer: no, see [this SO question](https://stackoverflow.com/q/38730692).
  Update 2: well, in all cases arrow functions actually solve my problem (not sure if that's a good thing but I'll take
  it)!
* One of the significant changes of Chrome's Manifest V3 over Manifest V2 is
  the [Action API unification](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#action-api-unification)
* I'm not sure how to do global state anymore since I've incorporated modules. In a browser extension context especially,
  a content script might be loaded multiple times, a web page script might be loaded multiple times and it's important
  for the subsequent loads to not have a negative effect. For example, the first load might initialize an listener
  object, and subsequent loads must not initialize a new listener object because then it leads to "double listens" and
  other unintended side effects. Plus I'm confused how to declare global variables in TypeScript. I should stick the to
  the `window` right?

## Reference

Materials I referenced when building this tool and deep diving on learning.

### MDN Web Docs

* [MDN Web docs: API docs for *NodeList*](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
* [MDN Web docs: API docs for *MutationObserver*](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
* [MDN Web docs: *JavaScript modules*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
* [MDN Web docs: toJSON() behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
* [MDN Web docs: "page_action"](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/page_action)
    * Note that the Manifest property `show_matches` (of `page_actions`) is only supported in Firefox. By default, page
      actions are hidden in Firefox but by contrast, page actions are shown by default in other browsers. This was a
      surprising find to me because I couldn't see the page action in the URL bar and I was confused! I need to
      explicitly enable it with the `show_matches` property.
* [MDN Web Docs: Manifest property "externally_connectable"](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable)
    * The `externally_connectable` is not supported in Firefox. An alternative must be used for message passing between
      the web page and the extension.
      See <https://github.com/mdn/webextensions-examples/tree/master/page-to-extension-messaging>.
* [MDN Web Docs: the EventTarget APIs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
* [MDN Web Docs: Window postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
* [MDN Web Docs: runtime.sendMessage()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage)
* [MDN Web Docs: browserAction.onClicked](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/onClicked)
* [MDN Web Docs: tabs.sendMessage()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage)
    * Send messages from background scripts to content scripts
    * [Chrome equivalent](https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage)
* [MDN Web Docs: extension storage API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)
    * > Enables extensions to store and retrieve data, and listen for changes to stored items.

### Chrome extension docs

* [Chrome extensions docs](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
* [Chrome extension docs: chrome.webRequest](https://developer.chrome.com/docs/extensions/reference/webRequest/)
    * Consider using this API to intercept requests instead of using a Proxy object on the web page
* [Chrome extension docs: Manifest V2 Getting started](https://developer.chrome.com/docs/extensions/mv2/getstarted/)
* [Chrome extension docs: chrome.browserAction](https://developer.chrome.com/docs/extensions/reference/browserAction/)

### Other

* [Meta Stack Exchange: Database schema for the Stack Exchange Data Explorer (SEDE)](https://meta.stackexchange.com/a/2678)
* [StackExchange: What are tags, and how should I use them?](https://stackoverflow.com/help/tagging)
  * This describes the tag naming convention. E.g. `command-line`, `powershell`  
* Multiple references on recommended/possible ways to render HTML dynamically from JS code in the browser (there are
  many but there is not an obvious choice!)
    * [StackOverflow Answer: Use `DOMParser`](https://stackoverflow.com/a/3104237)
    * [StackOverflow Answer: Use `createElement` and extract the `innerHTML`](https://stackoverflow.com/a/3104251)
    * [StackOverflow Answer: Use `insertAdjacentHtml`](https://stackoverflow.com/a/19241659)
    * [StackOverflow Answer: Use `<template>`](https://stackoverflow.com/a/35385518)
    * [StackOverflow Answer: Use `createContextualFragment`](https://stackoverflow.com/a/7326602/1333713)
* [`dgroomes/web-playground/browser-extensions`](https://github.com/dgroomes/web-playground/tree/main/browser-extensions)
    * My own reference project for Chrome extensions
* [Extension Workshop: Porting a Google Chrome extension](https://extensionworkshop.com/documentation/develop/porting-a-google-chrome-extension/)
    * Shoot, Firefox doesn't support Manifest v3 and I spent all this time writing a Chrome extension in Manifest v3. I
      wish I had implemented in Manifest v2 so that I could compatibility with Firefox.
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
* [Opera dev docs: *The Basics of Making an Extension*](https://dev.opera.com/extensions/basics/)
* [Deno: "A modern runtime for JavaScript and TypeScript."](https://deno.land/)
