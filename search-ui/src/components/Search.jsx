import algoliasearch from "algoliasearch/lite";
import {Configure, Highlight, Hits, InstantSearch, Pagination, SearchBox,} from "react-instantsearch-hooks-web";

// Algolia app IDs and API keys are not exactly secrets because they are used client-side where anyone can see them. But
// I'll still omit them and instead load them from the environment. Fortunately this is easy with Next.js.
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const searchClient = algoliasearch(APP_ID, API_KEY);

/**
 * A simple mashup of Algolia UI control elements.
 */
export default function Search() {
    return (
        <div className="container">
            <InstantSearch searchClient={searchClient} indexName="sample_stackoverflow_posts">
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

function Hit({hit}) {
    return (
        <article>
            <h1>
                <Highlight attribute="post_title" hit={hit}/>
            </h1>
            <p>
                <Highlight attribute="author_name" hit={hit}/>
            </p>
            <p>
                <Highlight attribute="content" hit={hit}/>
            </p>
        </article>
    );
}
