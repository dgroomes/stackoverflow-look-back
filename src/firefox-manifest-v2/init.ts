// Core extension initialization code for the "Firefox Manifest V2" web extension.

import {initRpcBackground} from "../../web-extension-framework/rpc-framework/rpc-backend.ts"
import {browser} from "../../web-extension-framework/web-extension-types/firefox-extension-types.d.ts"

console.debug("[firefox-manifest-v2/init.js] Initializing...")

browser.runtime.onInstalled.addListener(() => {
    // noinspection JSIgnoredPromiseFromCall
    initRpcBackground("firefox")
})
