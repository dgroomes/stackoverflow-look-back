chrome = chrome || chrome // Re-assign 'chrome' so the IDE doesn't show warnings for all usages
let votesPageLimitEl = document.getElementById("votes-page-limit")

let form = document.getElementById("options-form")
form.addEventListener("submit", async event => {
    event.preventDefault() // Prevent a form POST request
    let newValue = votesPageLimitEl.value
    await new Promise(resolve => {
        chrome.storage.local.set({votesPageLimit: newValue}, () => {
            console.log(`Saved value '${newValue}'`)
            resolve()
        })
    })
})

// Initialize the form field with the value saved in the browser storage
async function init() {
    votesPageLimitEl.value = await new Promise((resolve) => {
        chrome.storage.local.get("votesPageLimit", (data) => {
            console.log(`Read the following value from storage for 'votesPageLimit': ${data.votesPageLimit}`)
            resolve(data.votesPageLimit)
        })
    })
}

init().then(() => console.log("[options.js] Initialized."))
