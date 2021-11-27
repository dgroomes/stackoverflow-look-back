import {injectInstrumentedPageScript} from "../../web-extension-framework/content-script-wiring.ts"

injectInstrumentedPageScript("web-page/votes-page-script.js").then(() => {
    console.debug("[votes-content-script.js] Done!");
});
