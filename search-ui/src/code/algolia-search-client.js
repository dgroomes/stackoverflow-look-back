import algoliasearch from "algoliasearch/lite";

/**
 * Instantiate an Algolia search client.
 *
 * @return {SearchClient}
 */
export default function algoliaSearchClient() {
    // Algolia app IDs and API keys are not exactly secrets because they are used client-side where anyone can see them. But
    // I'll still omit them and instead load them from the environment. Fortunately this is easy with Next.js.
    const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

    return algoliasearch(APP_ID, API_KEY);
}
