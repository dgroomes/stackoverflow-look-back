import algoliasearch from "algoliasearch/lite";
import {Configure, Highlight, Hits, InstantSearch, Pagination, SearchBox,} from "react-instantsearch-hooks-web";

// Algolia app IDs and API keys are not exactly secrets because they are used client-side where anyone can see them. But
// I'll still omit them and instead load them from the environment. Fortunately this is easy with Next.js.
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const INDEX_NAME = "posts_full";

const searchClient = algoliasearch(APP_ID, API_KEY);

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
 * Given a post's data, build a URL to the post.
 *
 * Interestingly, answer posts can be reached by the same "questions/" URL path as questions. StackOverflow just redirects
 * to the right URL. This is convenient!
 */
function Link({post}) {
    const url = `https://stackoverflow.com/questions/${post.id}`;
    return <a href={url}>link</a>;
}

function Hit({hit}) {
    return (
        <article>
            <h1>
                <Highlight attribute="title" hit={hit}/>
            </h1>
            <p>
                <Highlight attribute="htmlBody" hit={hit}/>
            </p>
            <p>
                <Highlight attribute="tags" hit={hit}/>
            </p>
            <Link post={hit}></Link>
        </article>
    );
}
