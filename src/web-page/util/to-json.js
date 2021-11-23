export {toJSON}

/**
 * This is a utility function to help define the "toJSON" function on classes so that the JSON.stringify picks up non-normal
 * fields.
 *
 * @param obj the object that is the subject of JSON.stringify
 * @param fieldNames non-normal field names that should be included in the stringification
 * @return {Object} a plain object which will ultimately be serialized to JSON
 *
 * Read more about toJSON at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
 */
function toJSON(obj, ...fieldNames) {
    let plainObj = {}

    for (let fieldName of fieldNames) {
        plainObj[fieldName] = obj[fieldName]
    }

    for (let name of Object.getOwnPropertyNames(obj)) {
        plainObj[name] = obj[name]
    }

    return plainObj
}
