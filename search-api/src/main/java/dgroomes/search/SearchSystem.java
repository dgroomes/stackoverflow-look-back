package dgroomes.search;

import dgroomes.Posts;
import dgroomes.posts.Post;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.StoredFields;
import org.apache.lucene.queryparser.flexible.core.QueryNodeException;
import org.apache.lucene.queryparser.flexible.standard.StandardQueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class encapsulates a "search system" over the StackOverflow post data.
 * <p>
 * It exposes a search API via a public method, and it encapsulates the internals of the data-under-search (the Lucene index).
 */
public class SearchSystem {

    public static final String FIELD_HTML_BODY = "html_body";
    private static final Logger log = LoggerFactory.getLogger(SearchSystem.class);

    private final Directory indexDir;
    private final Analyzer analyzer;
    private final Map<Long, Post> postsById = new HashMap<>();

    public SearchSystem(Directory indexDir, Analyzer analyzer) {
        this.indexDir = indexDir;
        this.analyzer = analyzer;
    }

    /**
     * Initialize the search system. This will execute the indexing process and the method returns when indexing is
     * complete.
     * <p>
     * It would be nice to encapsulate the {@link Directory} and {@link Analyzer} instances as implementation details
     * inside this initialization method, but I would prefer to have control over the lifecycle of these objects by
     * having the calling code inject them, and the calling code also close the objects using a try-with-resources block.
     * It's a trade-off.
     */
    public static SearchSystem init(Directory indexDir, Analyzer analyzer) {
        var searchSystem = new SearchSystem(indexDir, analyzer);
        searchSystem.indexData();
        return searchSystem;
    }

    /**
     * Search for the given keyword. This will search the post HTML body and, and the question title (for question
     * posts).
     */
    public List<SearchResult<Post>> search(String keyword) {
        DirectoryReader reader;
        try {
            reader = DirectoryReader.open(indexDir);
        } catch (IOException e) {
            throw new IllegalStateException("Unexpected error opening the Lucene index", e);
        }

        log.info("Searching for entities using the keyword: '{}' ...", keyword);
        IndexSearcher searcher = new IndexSearcher(reader);
        StoredFields storedFields;
        try {
            storedFields = searcher.storedFields();
        } catch (IOException e) {
            throw new RuntimeException("Something went wrong during search initialization.", e);
        }
        var queryParser = new StandardQueryParser(new StandardAnalyzer());
        queryParser.setAllowLeadingWildcard(true);

        List<ScoreDoc> hits;

        try {
            Query query = queryParser.parse(keyword, FIELD_HTML_BODY);
            TopDocs results = searcher.search(query, 2000);
            ScoreDoc[] packageNameHits = results.scoreDocs;
            hits = List.of(packageNameHits);
        } catch (QueryNodeException | IOException e) {
            throw new IllegalStateException("Unexpected error while searching", e);
        }

        log.info("Found {} hits", hits.size());

        List<SearchResult<Post>> results = hits.stream()
                .map(scoreDoc -> {
                    try {
                        Document doc = storedFields.document(scoreDoc.doc);
                        long id = doc.getField("id").numericValue().longValue();
                        Post post = postsById.get(id);
                        return new SearchResult<>(post, doc, scoreDoc);
                    } catch (IOException e) {
                        throw new IllegalStateException("Unexpected error while getting the document from the index", e);
                    }
                })
                .toList();

        try {
            reader.close();
        } catch (IOException e) {
            throw new RuntimeException("The search procedure was almost complete but the reader failed to close", e);
        }

        return results;
    }

    /**
     * Index the domain data into an in-memory Lucene index.
     * <p>
     * todo Consider creating an Indexer inner class. Maybe it creates the index and then can go away.
     */
    private void indexData() {
        try (var indexWriter = indexWriter(indexDir, analyzer)) {

            List<Post> posts = Posts.readPostData();
            log.info("Indexing {} StackOverflow posts...", posts.size());

            for (var post : posts) {
                var doc = new Document();

                doc.add(new StoredField("id", post.id()));
                doc.add(new TextField(SearchSystem.FIELD_HTML_BODY, post.htmlBody(), Field.Store.YES));
                // todo index the tags. Should I use a second index? Or overload the existing index with tags and empties?

                postsById.put(post.id(), post);

                indexWriter.addDocument(doc);
            }

            log.info("Indexing done.");
        } catch (Exception e) {
            log.error("Unexpected error while indexing.", e);
            System.exit(1);
        }
    }

    private static IndexWriter indexWriter(Directory dir, Analyzer analyzer) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);

        // This configuration removes any pre-existing index files.
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);

        return new IndexWriter(dir, config);
    }
}
