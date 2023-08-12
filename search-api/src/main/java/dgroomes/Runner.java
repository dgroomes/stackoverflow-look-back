package dgroomes;

import dgroomes.http.HttpHandler;
import dgroomes.http.LoggingExceptionListener;
import dgroomes.search.SearchSystem;
import org.apache.hc.core5.http.impl.bootstrap.HttpServer;
import org.apache.hc.core5.http.impl.bootstrap.ServerBootstrap;
import org.apache.hc.core5.io.CloseMode;
import org.apache.hc.core5.util.TimeValue;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * A search API for the *Look Back Tool*. See the README for more information.
 */
public class Runner {
    private static final Logger log = LoggerFactory.getLogger(Runner.class);

    private static final int PORT = 8080;

    public static void main(String[] args) {

        try (Directory indexDir = new ByteBuffersDirectory();
             Analyzer analyzer = new StandardAnalyzer()) {

            SearchSystem searchSystem = SearchSystem.init(indexDir, analyzer);
            runServerContinuously(searchSystem);
        } catch (IOException e) {
            log.error("Unexpected error", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Run the HTTP server. This runs continuously until the process is stopped with "Ctrl + C".
     */
    private static void runServerContinuously(SearchSystem timeZoneSearchSystem) throws IOException {
        var simulatorHttpHandler = new HttpHandler(timeZoneSearchSystem);

        ServerBootstrap builder = ServerBootstrap.bootstrap()
                .setListenerPort(PORT)
                .setExceptionListener(new LoggingExceptionListener())
                .register("*", simulatorHttpHandler);

        try (HttpServer server = builder.create()) {
            server.start();
            Runtime.getRuntime().addShutdownHook(new Thread(() -> server.close(CloseMode.GRACEFUL)));
            log.info("The Lucene search server is serving traffic on port {}", PORT);
            server.awaitTermination(TimeValue.MAX_VALUE);
        } catch (InterruptedException e) {
            log.error("The server was interrupted.", e);
        }
    }
}
