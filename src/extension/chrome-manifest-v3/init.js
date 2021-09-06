// Core extension initialization code for the "Chrome Manifest V3" web extension.

console.log("[chrome-manifest-v3/init.js] Initializing...")

browserName = "chrome"

importScripts("extension/common/init-common.js")

chrome.runtime.onInstalled.addListener(() => {
    setDefaultConfig()
})

addCommandsListener()
