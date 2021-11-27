import {injectInstrumentedPageScript} from "../../web-extension-framework/content-script-wiring.ts"

injectInstrumentedPageScript("web-page/posts-page-script.js").then(() => {
    console.debug("[posts-content-script.js] Done!");
});
