// Core extension initialization code for the "Firefox Manifest V2" web extension.

console.debug("[firefox-manifest-v2/init.js] Initializing...")

browser.runtime.onInstalled.addListener(() => {
    setConfig()
    // noinspection JSIgnoredPromiseFromCall
    initRpcBackground("firefox")
})
