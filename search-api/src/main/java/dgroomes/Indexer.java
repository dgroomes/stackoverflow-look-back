package dgroomes;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;

import java.io.IOException;

/**
 * Index time zone display names. For example "Alaska Standard Time", "Armenia Standard Time", "Chile Time", etc.
 *
 * Note: it would be cool to also index the offset from GMT.
 */
public class Indexer {

  public static final String FIELD_TIME_ZONE_DISPLAY_NAME = "time_zone_display_name";

  private final IndexWriter indexWriter;

  public Indexer(IndexWriter indexWriter) {
    this.indexWriter = indexWriter;
  }

  public void index(String timeZoneDisplayName) throws IOException {
    var doc = new Document();
    doc.add(new TextField(FIELD_TIME_ZONE_DISPLAY_NAME, timeZoneDisplayName, Field.Store.YES));
    indexWriter.addDocument(doc);
  }
}
