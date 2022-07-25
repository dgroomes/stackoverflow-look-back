# search-api

An experimental HTTP search API for the StackOverflow *Look Back Tool*.

---
**WARNING**: This is experimental. I really like using Algolia and I will continue using it. But I often like to run
my system in a local offline fashion during my development workflow. This gives me control and deep understanding. I can
do things like mock error responses from the API, or use a tailored set of sample data. This `search-api/` directory
is an attempt to implement a search API to substitute for Algolia. I'll base this implementation off of my work in
[`lucene-playground/http-api`](https://github.com/dgroomes/lucene-playground/tree/a7e6815f4cb21e0779bb72b5022f9831534f35eb/http-api).

---


## Description

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
     todo
     ```
4. Stop the server
   * Stop the server process with `Ctrl + C`.

## TODO

Stuff that needs implementing/designing/deciding:

* [ ] Read the sample posts
* [ ] Index the sample posts (the htmlBody)
* [ ] Nice to have. Can we index the htmlBody and the tags separately?
* [ ] JSONify the API response (so it can be used the search-ui).
* [ ] Adapt search-ui to point optionally to Algolio or search-api. This should be decently possible, a lot of projects
      use the algolia-ui tools and don't use Algolia API.
