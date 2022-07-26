package dgroomes.http;

import dgroomes.posts.Post;
import dgroomes.search.SearchResult;
import dgroomes.search.SearchSystem;
import org.apache.hc.core5.http.ClassicHttpRequest;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.HttpException;
import org.apache.hc.core5.http.NameValuePair;
import org.apache.hc.core5.http.io.HttpRequestHandler;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.http.protocol.HttpContext;
import org.apache.hc.core5.net.URIBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * This handles incoming HTTP requests that represent searches.
 */
public class HttpHandler implements HttpRequestHandler {

  private final SearchSystem timeZoneSearchSystem;

  public HttpHandler(SearchSystem timeZoneSearchSystem) {
    this.timeZoneSearchSystem = timeZoneSearchSystem;
  }

  @Override
  public void handle(final ClassicHttpRequest request, final ClassicHttpResponse response, final HttpContext context) throws HttpException, IOException {
    Optional<String> keywordOpt = parseKeyword(request);
    if (keywordOpt.isEmpty()) {
      response.setCode(400);
      response.setEntity(new StringEntity("The 'keyword' query parameter is required. Please supply it."));
      return;
    }

    var keyword = keywordOpt.get();
    List<SearchResult<Post>> results = timeZoneSearchSystem.search(keyword);

    var msgBody = results.stream()
            .map(result -> result.doc().get(SearchSystem.FIELD_HTML_BODY))
            .sorted()
            .map(timeZone -> {
              // Indent it for easier reading.
              return "\t" + timeZone;
            })
            .collect(Collectors.joining("\n", "", ""));

    String msg;
    if (results.isEmpty()) {
      msg = "No search results found for keyword '%s'".formatted(keyword);
    } else {
      msg = """
              Search found %d results for keyword '%s':
              %s
              """.formatted(results.size(), keyword, msgBody);
    }

    var responseBody = new StringEntity(msg);
    response.setEntity(responseBody);
  }

  /**
   * Parse out the "keyword" query parameter if it exists. If it does not exist, an empty {@link Optional} is returned.
   */
  private Optional<String> parseKeyword(ClassicHttpRequest request) {
    URI uri;
    try {
      uri = request.getUri();
    } catch (URISyntaxException e) {
      throw new IllegalStateException("Unexpected error while parsing the HTTP request URI", e);
    }

    var params = parseQueryParams(uri);
    if (params.containsKey("keyword")) {
      return Optional.of(params.get("keyword"));
    } else {
      return Optional.empty();
    }
  }

  /**
   * Parse query parameters into a map.
   * <p>
   * This also normalizes the query parameter names by lower-casing them so you can predictably call "get" on the map.
   *
   * @return a map of the query parameter/value pairs, keyed by query parameter name.
   */
  private Map<String, String> parseQueryParams(URI uri) {
    return new URIBuilder(uri)
            .getQueryParams()
            .stream()
            .collect(Collectors.toMap(nameValuePair -> nameValuePair.getName().toLowerCase(), NameValuePair::getValue));
  }
}
