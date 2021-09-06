// Core extension initialization code for the "Firefox Manifest V2" web extension.

console.log("[firefox-manifest-v2/init.js] Initializing...")

browserName = "firefox"

browser.runtime.onInstalled.addListener(() => {
    setDefaultConfig()
})

addRpcListener()
