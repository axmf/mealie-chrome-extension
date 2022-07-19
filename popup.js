console.log("Popup.js loaded");

function importRecipe() {
    //Restore saved preferences
    var token;
    chrome.storage.sync.get("accessToken", function (accessTokenString) {
        var json = JSON.parse(accessTokenString.accessToken);
        token = json["access_token"];
    });

    //Restore mealie url from storage
    var mealieUrl;
    chrome.storage.sync.get("mealieUrl", function (mealieUrlString) {
        mealieUrl = mealieUrlString.mealieUrl;
    });
    //Restore includeTags from storage
    var includeTags;
    chrome.storage.sync.get("includeTags", function (includeTagsString) {
        includeTags = includeTagsString.includeTags;
    });

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var urlToImport;
        urlToImport = tabs[0].url;
        console.log("Tabs url: " + urlToImport);

        var myHeaders = new Headers();

        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("accept", "application/json");
        myHeaders.append("Content-Type", "application/json");

        //TODO use includeTags
        var raw = JSON.stringify({
            "url": urlToImport,
            "includeTags": true
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        console.log("Request options: " + JSON.stringify(requestOptions));
        var status = document.getElementById("status");
        status.innerHTML = "Importing recipe...";
        fetch(mealieUrl + "/api/recipes/create-url", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log("Result: " + result);
                status.innerHTML = "Recipe imported with id: " + result;
                status.style.backgroundColor = "green";
            })
            .then(function () {
                setTimeout(function () {
                    window.close();
                }, 3000);
            })
            .catch(error => {
                status.innerHTML = "Error importing recipe: " + error;
                status.style.backgroundColor = "red";
                console.log('error', error)
            });
    });
}

importRecipe();