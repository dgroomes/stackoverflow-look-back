import algoliasearch from "algoliasearch/lite";
import {Configure, Highlight, Hits, InstantSearch, Pagination, SearchBox,} from "react-instantsearch-hooks-web";
import {StackOverflowPostLink} from "./StackOverflowPostLink";
import {RawHtml} from "./RawHtml";

// Algolia app IDs and API keys are not exactly secrets because they are used client-side where anyone can see them. But
// I'll still omit them and instead load them from the environment. Fortunately this is easy with Next.js.
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const INDEX_NAME = "posts_full";

// const searchClient = algoliasearch(APP_ID, API_KEY);
const searchClient = {
    clearCache: () => this.clearCache(),
    search: async function(instantsearchRequests) {
        return {
            "results": [
                {
                    "hits": [
                        {
                            "htmlBody": "<p>I'm using Bash. I have a Bash script. How can I tell if the script is a symlink, from within the script?</p>\n",
                            "id": 1,
                            "questionId": 1,
                            "type": "question",
                            "objectID": "1",
                            "_highlightResult": {
                                "htmlBody": {
                                    "value": "<p>I'm using Bash. I have a Bash __ais-highlight__script__/ais-highlight__. How can I tell if the script is a symlink, from within the script?\n",
                                    "matchLevel": "full",
                                    "fullyHighlighted": false,
                                    "matchedWords": [
                                        "script"
                                    ]
                                },
                                "id": {
                                    "value": "2",
                                    "matchLevel": "none",
                                    "matchedWords": []
                                },
                                "questionId": {
                                    "value": "1",
                                    "matchLevel": "none",
                                    "matchedWords": []
                                },
                                "type": {
                                    "value": "answer",
                                    "matchLevel": "none",
                                    "matchedWords": []
                                }
                            }
                        }
                    ],
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
        }
    },
    searchForFacetValues: async function(instantsearchRequests) {
        return {}
    }
}

/**
 * A simple mashup of Algolia UI control elements.
 */
export default function Search() {
    return (
        <div className="container">
            <InstantSearch searchClient={searchClient} indexName={INDEX_NAME}>
                <Configure hitsPerPage={8}/>
                <div className="search-panel">
                    <div className="search-panel__results">
                        <SearchBox placeholder="" className="searchbox"/>
                        <Hits hitComponent={Hit}/>

                        <div className="pagination">
                            <Pagination/>
                        </div>
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
}

/**
 *  Note: this is implemented based on my similar code in https://github.com/dgroomes/javascript-playground/blob/d93cf0d5756accf089e0cc23bef385bc88051a0f/misc/string-highlighting.mjs#L46
 *
 * @param {String} textContent - The text content of a text node
 * @param {Array<string>} matchedWords - These are the words that need to be highlighted in the textContent.
 * @return {Array<ReactElement | string>} an array of React elements that highlight the search results and strings for
 * those parts of the text node that do not contain a search result.
 */
function highlight(textContent, matchedWords) {
    const safeMatchedWords = matchedWords.slice();
    const matchedWord = safeMatchedWords.pop();

    let sections = textContent.split(matchedWord);

    if (safeMatchedWords.length > 0) {
        sections = sections.map(section => highlight(section, safeMatchedWords));
    }

    if (sections.length === 1) {
        return [textContent];
    }

    const highlightedMatchedWord = <mark className="ais-Highlight-highlighted">{matchedWord}</mark>;
    // This is a bit strange but basically splice a "highlighted text React element" between every entry of the 'sections'
    // array. The 'join()' method works great for joining elements into a string but I'm trying to join them into
    // a bigger array where each element is linked by a "joiner" highlight.
    const elements = sections.flatMap(section => {
        return [section, highlightedMatchedWord];
    });
    // There is one too many highlighted elements. Pop it off.
    elements.pop();
    return elements;
}

function Hit({hit}) {

    function highlightHtmlBody(htmlBody) {
        let matchedWords = hit._highlightResult.htmlBody.matchedWords;
        return highlight(htmlBody, matchedWords);
    }

    const htmlBody = hit.htmlBody;

    return (
        <article>
            <h1>
                <Highlight attribute="title" hit={hit}/>
            </h1>
            <p>
                {/* TODO: Make a higher-level HandleRawHtml component. I realize I've used the word "high level component"
                        now and that should trigger "Hey I should write a React Hook for this. But I don't see how to do
                        that. */}
                <RawHtml textNodeHandler={highlightHtmlBody}>{htmlBody}</RawHtml>
            </p>
            <p>
                <Highlight attribute="tags" hit={hit}/>
            </p>
            <StackOverflowPostLink post={hit}></StackOverflowPostLink>
        </article>
    );
}
