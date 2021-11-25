// Type declarations for the Chrome web extension JavaScript API.

export {Chrome, Runtime, chrome}

declare var chrome: Chrome

interface Chrome {
    runtime: Runtime
    storage: Storage
    tabs: Tabs
}

/**
 * The "chrome.runtime" API https://developer.chrome.com/docs/extensions/reference/runtime/
 */
interface Runtime {

    // https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage
    sendMessage(
        extensionId: string | null,
        message: any,
        options: object | null,
        responseCallback: () => void | null
    ): void


    sendMessage(
        extensionId: string | null,
        message: any,
        options: object | null
    ): void

    // https://developer.chrome.com/docs/extensions/reference/runtime/#method-getURL
    getURL(url: string): string

    // https://developer.chrome.com/docs/extensions/reference/runtime/#event-onMessage
    onMessage: EventRegisterer
}

/**
 * The "chrome.storage" API https://developer.chrome.com/docs/extensions/reference/storage/
 */
interface Storage {
    local: StorageArea
}

/**
 * https://developer.chrome.com/docs/extensions/reference/storage/#type-StorageArea
 */
interface StorageArea {
    get(key: string): Promise<any>

    get(key: string, callback: (found: any) => void): Promise<any>

    set(items: any): Promise<any>

    set(items: any, callback: () => void): Promise<any>
}

/**
 * https://developer.chrome.com/docs/extensions/reference/runtime/#event
 *
 * I've made up the name "EventRegisterer". I don't know what name to use because the Chrome docs don't refer to this
 * type by name.
 */
interface EventRegisterer {

    // Note: I'm not sure how to express a function with an unknown arity. So I'll just an "any" here.
    addListener(callback: any): void

    // This method isn't documented in https://developer.chrome.com/docs/extensions/reference/runtime/ but the method
    // exists.
    removeListener(fn: any): void
}

/**
 * https://developer.chrome.com/docs/extensions/reference/tabs/
 */
interface Tabs {
    // https://developer.chrome.com/docs/extensions/reference/tabs/#method-executeScript
    executeScript(
        details: InjectDetails,
        callback: () => void
    ) : void

    // https://developer.chrome.com/docs/extensions/reference/tabs/#method-create
    create(createProperties: {
        url: string
    }) : void
}

/**
 * https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-InjectDetails
 */
interface InjectDetails {
    file: string
}
