import {Configure, Highlight, Hits, InstantSearch, Pagination, SearchBox,} from "react-instantsearch";
import {StackOverflowPostLink} from "./StackOverflowPostLink";
import {RawHtml} from "./RawHtml";
import SearchApiSearchClient from "../code/search-api-search-client";
import algoliaSearchClient from "../code/algolia-search-client";

let searchClient;

/**
 * Detect if the app should use a local instance of the 'search-api' or the Algolia API.
 */
const searchClientType = process.env.NEXT_PUBLIC_SEARCH_CLIENT;
if (searchClientType === "search-api") {
    console.log("Using the 'search-api' search client.");
    searchClient = new SearchApiSearchClient();
} else if (searchClientType === "algolia") {
    console.log("Using the Algolia search client directly.");
    searchClient = algoliaSearchClient();
} else {
    throw new Error(`Unknown search client type: ${searchClientType}`);
}

const INDEX_NAME = "posts_full";

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
                        <SearchBox placeholder="Search here" className="searchbox"/>
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
    // array. The 'join()' method works great for joining elements into a string, but I'm trying to join them into
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
