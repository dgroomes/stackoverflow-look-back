export {downloadToFile};

/**
 * Download the given data to a file. The given data must already be a string. So, for example, if you want to download
 * an array's contents to a file you must first serialize to a JSON string using "JSON.stringify".
 *
 * @param {String} data the data to download to a file
 * @param fileName the name to give the downloaded file
 *
 * This uses a feature called Data URLs (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
 */
function downloadToFile(data, fileName) {
    let encoded = encodeURIComponent(data)

    let el = document.createElement('a')
    el.setAttribute('href', `data:,${encoded}`)
    el.setAttribute('download', fileName)
    el.click()
}
