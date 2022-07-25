package dgroomes;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
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
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

/**
 * This class encapsulates a "search system".
 *
 * It exposes a search API via a public method and it encapsulates the internals of the data-under-search (the Lucene index).
 * The data-under-search is toy data. It's a set of time zones names.
 */
public class TimeZoneSearchSystem {

  private static final Logger log = LoggerFactory.getLogger(TimeZoneSearchSystem.class);

  private final Directory indexDir;
  private final Analyzer analyzer;

  public TimeZoneSearchSystem(Directory indexDir, Analyzer analyzer) {
    this.indexDir = indexDir;
    this.analyzer = analyzer;
  }

  /**
   * Initialize the search system. This will execute the indexing process and the method returns when indexing is
   * complete.
   *
   * It would be nice to encapsulate the {@link Directory} and {@link Analyzer} instances as implementation details
   * inside this initialization method, but I would prefer to have control over the lifecycle of these objects by
   * having the calling code inject them, and the calling code also close the objects using a try-with-resources block.
   * It's a trade-off.
   */
  public static TimeZoneSearchSystem init(Directory indexDir, Analyzer analyzer) {
    TimeZoneSearchSystem timeZoneSearchSystem = new TimeZoneSearchSystem(indexDir, analyzer);
    timeZoneSearchSystem.indexData();
    return timeZoneSearchSystem;
  }

  /**
   * Search for the given keyword.
   */
  public List<Document> search(String keyword) {
    DirectoryReader reader = null;
    try {
      reader = DirectoryReader.open(indexDir);
    } catch (IOException e) {
      throw new IllegalStateException("Unexpected error opening the Lucene index", e);
    }

    log.info("Searching for time zones using the keyword: '{}'", keyword);
    IndexSearcher searcher = new IndexSearcher(reader);
    StandardQueryParser queryParser = new StandardQueryParser(new StandardAnalyzer());

    List<ScoreDoc> hits;

    try {
      Query query = queryParser.parse(keyword, Indexer.FIELD_TIME_ZONE_DISPLAY_NAME);
      TopDocs results = searcher.search(query, 2000);
      ScoreDoc[] packageNameHits = results.scoreDocs;
      hits = List.of(packageNameHits);
    } catch (QueryNodeException | IOException e) {
      throw new IllegalStateException("Unexpected error while searching", e);
    }

    log.info("Found {} hits", hits.size());

    return hits.stream()
            .map(hit -> {
              try {
                return searcher.doc(hit.doc);
              } catch (IOException e) {
                throw new IllegalStateException("Unexpected error while getting the document from the index", e);
              }
            })
            .toList();
  }

  /**
   * Index the domain data into an in-memory Lucene index.
   */
  private void indexData() {
    try (var indexWriter = indexWriter(indexDir, analyzer)) {

      List<String> timeZoneDisplayNames = findTimeZones();
      log.info("Indexing {} known time zones.", timeZoneDisplayNames.size());

      var indexer = new Indexer(indexWriter);
      for (var timeZoneDisplayName : timeZoneDisplayNames) {
        indexer.index(timeZoneDisplayName);
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

  private static List<String> findTimeZones() {
    String[] timeZoneIds = TimeZone.getAvailableIDs();
    return Arrays.stream(timeZoneIds)
            .map(id -> TimeZone.getTimeZone(id).getDisplayName(Locale.US))
            // Filter out "GMT" because the results are not interesting. They just describe offsets not places.
            .filter(displayName -> !displayName.startsWith("GMT"))
            .distinct()
            .sorted()
            .toList();
  }

}
