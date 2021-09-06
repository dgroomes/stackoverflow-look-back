// Core extension initialization code for the "Chromium Manifest V3" web extension.

console.log("[chromium-manifest-v3/init.js] Initializing...")

browserDescriptor = "chromium"

importScripts("extension/common/init-common.js")

chrome.runtime.onInstalled.addListener(() => {
    setDefaultConfig()
})

addRpcListener()
