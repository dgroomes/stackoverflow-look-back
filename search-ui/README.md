# search-ui

This is an experimental UI for searching my StackOverflow up-voted posts using Algolia.


## Instructions

Follow these instructions to build and run the UI:

1. Install dependencies:
    * ```shell
      npm install
      ```
1. Serve and continuously build the site with the development server:
    * ```shell
      npm run dev
      ```
1. Open the page and try it out
   * Open the browser to <http://localhost:3000>.

To build the site for deployment to GitHub Pages, use a special environment variable. The build command looks like this:

```shell
npm run build-target-gh-pages
```

To point the app to a local Lucene-based API implemented the `search-api/` project, add a special environment variable
like this:

```shell
NEXT_PUBLIC_SEARCH_CLIENT=search-api npm run dev
```


## Reference

* [Algolia](https://www.algolia.com/)
* [Algolia docs: *Using UI widgets*](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks#using-ui-widgets)
* [Next.js docs: *Environment Variables*](https://nextjs.org/docs/basic-features/environment-variables)
* [Algolia API reference: *Search Multiple Indices*](https://www.algolia.com/doc/api-reference/api-methods/multiple-queries/#json-format)
  * This shows an example JSON response.
