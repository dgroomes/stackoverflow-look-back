// Core extension initialization code for the "Firefox Manifest V2" web extension.

console.debug("[firefox-manifest-v2/init.js] Initializing...")

browserDescriptor = "firefox"

browser.runtime.onInstalled.addListener(() => {
    setDefaultConfig()
})

addRpcServer(FirefoxBackgroundScriptRpcServer)
