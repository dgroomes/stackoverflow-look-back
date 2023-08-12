# search-api

An experimental HTTP search API for the StackOverflow *Look Back Tool*.

---
**WARNING**: This is experimental. I really like using Algolia and I will continue using it. But I often like to run
my system in a local offline fashion during my development workflow. This gives me control and deep understanding. I can
do things like mock error responses from the API, or use a tailored set of sample data. This `search-api/` directory
is an attempt to implement a search API to substitute for Algolia. I'll base this implementation off of my work in
[`lucene-playground/http-api`](https://github.com/dgroomes/lucene-playground/tree/a7e6815f4cb21e0779bb72b5022f9831534f35eb/http-api).

---


## Overview

This project implements a runnable Java program that embeds Lucene into a web server.  


## Instructions

Follow these instructions to build and run a Lucene demo program:

1. Use Java 17
2. Build and run the program:
   * ```shell
     ./gradlew run
     ```
3. Make some search requests
   * ```shell
     curl --request GET --url 'http://localhost:8080/?keyword=bash'
     ```
   * ```shell
     curl --request GET --url 'http://localhost:8080/?keyword=us*'
     ```
4. Stop the server
   * Stop the server process with `Ctrl + C`.


## Wish List

General clean-ups, TODOs and things I wish to implement for this project:

* [x] DONE Read the sample posts
* [x] DONE Index the sample posts (the htmlBody)
* [ ] IN PROGRESS Index and search on question titles
   * DONE Serve the title in the API JSON response
   * DONE Index
   * Search
* [ ] Index and search on the tags (maybe figure out facets first?)
   * Index
   * Search (this might have to go away with facets because the shape is different than the "main content")
* [ ] Facet search
* [x] DONE JSONify the API response (so it can be used the search-ui).
* [x] DONE Adapt search-ui to point optionally to Algolia or search-api. This should be decently possible, a lot of projects
      use the algolia-ui tools and don't use Algolia API.
      * An example of adapting the Algolia client is <https://github.com/typesense/typesense-instantsearch-adapter>
* [ ] How to report highlighting data? Lucene has server-side highlighting, but in React, I don't really want to `dangerouslySetInnerHtml`
      ... although I totally could. That's probably best for "nike just do it".
* [ ] Do I really need to store any fields besides into the Lucene index besides the post ID? Because we already have
  access to the full post data outside of Lucene.
