console.log("[web-generate-html.js] Running...")

programReady.then(() => {
    htmlGenerator.generateHtml().then(() => console.log("HTML was generated successfully"))
})
