package dgroomes.search;

import org.apache.lucene.document.Document;
import org.apache.lucene.search.ScoreDoc;

/**
 * This is kind of a silly design. It combines lots of things. But I'm still learning so might as well throw the kitchen
 * kitchen sink at the design for now.
 *
 * Breakdown from most contrete thing to most abstract thing:
 *
 * - The {@link T} object is the domain object. This the in-memory representation of the domain data that is indexed.
 * - The {@link Document} is the document entry in the Lucene index. This is the Lucene-ified version of the domain
 *   object.
 * - The {@link ScoreDoc} I'm not exactly sure what this is. I think it's metadata about the Lucene search result. I
 *   guess this makes perfect sense.
 */
public record SearchResult<T>(T domain, Document doc, ScoreDoc scoreDoc) {
}
