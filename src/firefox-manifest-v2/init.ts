// Core extension initialization code for the "Firefox Manifest V2" web extension.

import {browser} from "../../browser-extension-framework/browser-types/firefox-types/global.d.ts"

console.debug("[firefox-manifest-v2/init.js] Initializing...")

browser.runtime.onInstalled.addListener(() => {
    console.debug("Installed.")
})
