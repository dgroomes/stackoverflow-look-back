chrome = chrome || chrome // Re-assign 'chrome' so the IDE doesn't show warnings for all usages
let votesPageLimitEl = document.getElementById("votes-page-limit");

let form = document.getElementById("options-form");
form.addEventListener("submit", async event => {
    event.preventDefault() // Prevent a form POST request
    let newValue = votesPageLimitEl.value;
    await saveVotesPageLimit(newValue)
})

// Initialize the form field with the value saved in Chrome storage
async function init() {
    votesPageLimitEl.value = await getVotesPageLimit()
}

init().then(() => console.log("Initialized."))
