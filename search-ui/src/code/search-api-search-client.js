import algoliasearch from "algoliasearch/lite";

/**
 * This is a client that can be used in the overall Algolia UI JavaScript library.
 *
 * This client wraps the regular Algolia SearchClient and adapts it to make requests and handle responses from the
 * Lucene-based API in the 'search-api/' project.
 */
export default class SearchApiSearchClient {

    constructor() {
        this.algoliaClient = algoliasearch("fake_app_id", "fake_api_key");
    }

    clearCache() {
        this.algoliaClient.clearCache();
    }

    /**
     * @param {MultipleQueriesQuery[]} instantsearchRequests
     */
    async search(instantsearchRequests) {

        // The Algolia library is designed to execute a "multi-search request" and handle a "multi-results response".
        // I don't yet understand this. I'll just design around the first search and first result.
        const firstRequest = instantsearchRequests[0];

        // The user-experience always starts with an empty search bar. The user should just see a set of arbitrary posts
        // from the whole corpus. We can accomplish that with a "match everything" search which is just the wildcard
        // character. I don't think this really counts as a search, but it works nicely.
        let query = firstRequest.params.query;
        if (query === "") {
            query = "*";
        }

        return await fetch(`http://localhost:8080?keyword=${query}`)
            .then(response => {
                const {status} = response;
                if (status !== 200) {
                    throw new Error(`Unexpected HTTP response status for the search: ${status}`)
                } else {
                    return response.json();
                }
            })
            .then(hits => {
                console.log({hits});
                const mapped = hits.map(hit => {
                    const id = hit.id;
                    const questionId = hit.question_id;
                    const type = hit.type;
                    const htmlBody = hit.html_body;
                    const mappedHit = {
                        id,
                        questionId,
                        type,
                        htmlBody,
                        "objectID":
                            "1",
                        "_highlightResult":
                            {
                                "id":
                                    {
                                        "value":
                                        id,
                                        "matchLevel":
                                            "none",
                                        "matchedWords":
                                            []
                                    }
                                ,
                                "questionId":
                                    {
                                        "value":
                                        questionId,
                                        "matchLevel":
                                            "none",
                                        "matchedWords":
                                            []
                                    }
                                ,
                                "type":
                                    {
                                        "value":
                                        type,
                                        "matchLevel":
                                            "none",
                                        "matchedWords":
                                            []
                                    }
                                ,
                                "htmlBody":
                                    {
                                        "value":
                                        htmlBody,
                                        "matchLevel":
                                            "full",
                                        "fullyHighlighted":
                                            false,
                                        "matchedWords":
                                            [
                                                query
                                            ]
                                    }
                            }
                    };

                    if (type === "question") {

                        // This is quite brittle.
                        mappedHit.title = hit.title;
                        mappedHit._highlightResult.title = {
                            value: hit.title
                        }

                        mappedHit.tags = hit.tags.join(",");
                        mappedHit._highlightResult.tags = {
                            value: hit.tags.join(",")
                        }
                    }

                    return mappedHit;
                });

                return {
                    "results":
                        [
                            {
                                "hits": mapped,
                                "nbHits": 1,
                                "page": 0,
                                "nbPages": 1,
                                "hitsPerPage": 1,
                                "exhaustiveNbHits": true,
                                "exhaustiveTypo": true,
                                "query": "script",
                                "params": "",
                                "index": "",
                                "renderingContent": {},
                                "processingTimeMS": 1
                            }
                        ]
                };
            })
            .catch(err => {
                console.log('Something went wrong during the search', err);

                // I'm not exactly sure how best to handle the error here. If your return an object with hits equal
                // to an empty array, the Algolia JS library will actually error with a "undefined/null" error because
                // it tries to dereference the first element in the empty array.
                //
                // I think logging the error and then return a "shell" object here is fine.
                return {
                    results: [
                        {
                            "hits": [
                                {
                                    "objectID": "1",
                                    "_highlightResult": {}
                                }
                            ],
                            "nbHits": 0,
                            "page": 0,
                            "nbPages": 1,
                            "hitsPerPage": 1,
                            "exhaustiveNbHits": true,
                            "exhaustiveTypo": true,
                            "query": "script",
                            "params": "",
                            "index": "",
                            "renderingContent": {},
                            "processingTimeMS": 1
                        }
                    ]
                }
            });
    }

    async searchForFacetValues(instantsearchRequests) {
        console.log("Not yet implemented");
        return {};
    }
}

