console.log("[web-generate-html.js] Running...")

programReady.then(() => {
    let download = "download" === location.hash.substring(1);
    htmlGenerator.generateHtml(download)
        .then(() => console.log("HTML was generated successfully"))
})
