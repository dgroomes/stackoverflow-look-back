package dgroomes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Objects;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class Util {

  /**
   * Read a classpath resource into a string.
   */
  public static String readClasspathResource(String path) {
    try (InputStream stream = Util.class.getResourceAsStream(path);) {

      Objects.requireNonNull(stream, () -> "Classpath resource '%s' not found. Did you forget the leading forward slash ('/') ?.".formatted(path));
      byte[] bytes = stream.readAllBytes();
      return new String(bytes);
    } catch (IOException e) {
      var msg = "Unexpected exception while reading classpath resource '%s'";
      throw new IllegalStateException(msg.formatted(path));
    }
  }

  /**
   * Turn an {@link Iterable} into a {@link Stream}
   */
  public static <T> Stream<T> toStream(Iterable<T> iterable) {
    Iterator<T> iterator = iterable.iterator();
    Spliterator<T> spliterator = Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED);
    return StreamSupport.stream(spliterator, false);
  }

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  public static final ObjectWriter writer = OBJECT_MAPPER.writerWithDefaultPrettyPrinter();

  /**
   * Deserialize a JSON string.
   */
  public static JsonNode readTree(String json) {
    try {
      return OBJECT_MAPPER.readTree(json);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("JSON string failed to parse", e);
    }
  }

  public static String toJson(Object obj) {
    try {
      return writer.writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("Failed to serialize to JSON", e);
    }
  }
}
