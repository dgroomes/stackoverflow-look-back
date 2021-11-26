import {injectInstrumentedPageScript} from "../../web-extension-framework/content-script-wiring.ts"

injectInstrumentedPageScript("web-page/web-injected.js")
    .then(() => {
        console.debug("[content-script-bootstrapper.js] Done!")
    })
