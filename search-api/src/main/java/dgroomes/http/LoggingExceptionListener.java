package dgroomes.http;

import org.apache.hc.core5.http.ConnectionClosedException;
import org.apache.hc.core5.http.ExceptionListener;
import org.apache.hc.core5.http.HttpConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.SocketTimeoutException;

/**
 * A simple exception listener that just logs exceptions.
 */
public class LoggingExceptionListener implements ExceptionListener {

  private static final Logger log = LoggerFactory.getLogger(LoggingExceptionListener.class);

  @Override
  public void onError(final Exception ex) {
    if (ex instanceof SocketTimeoutException) {
      log.trace("Connection timed out", ex);
    } else if (ex instanceof ConnectionClosedException) {
      log.trace("Connection closed", ex);
    } else {
      log.error("Unexpected exception", ex);
    }
  }

  @Override
  public void onError(final HttpConnection conn, final Exception ex) {
    onError(ex);
  }
}
