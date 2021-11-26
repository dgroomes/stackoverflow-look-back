export {satisfied}

/**
 * This function must be invoked in the web page. It sends the "page-script-satisfied" signal to the backend components
 * of "web-extension-framework"
 *
 * This function would be used to instrument the "dcl-page-script.js" file as described in the "Detect Code Libraries"
 * example in the README.
 */
function satisfied() {
    console.debug("[page-wiring.js] Initializing...");
    window.postMessage("page-script-satisfied", "*");
}
