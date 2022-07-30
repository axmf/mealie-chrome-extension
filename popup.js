console.log("Popup.js loaded");

function getSavedToken() {
    chrome.storage.sync.get("accessToken", function (accessTokenString) {
        var json = JSON.parse(accessTokenString.accessToken);
        token = json["access_token"];
    });
}

function getSavedMealieUrl() {
    chrome.storage.sync.get("mealieUrl", function (mealieUrlString) {
        mealieUrl = mealieUrlString.mealieUrl;
        console.log("Mealie url: " + mealieUrl);
    });
}

function importRecipe() {
    //Restore saved preferences
    token = getSavedToken();
    //Restore mealie url from storage
    mealieUrl = getSavedMealieUrl();

    //Restore includeTags from storage
    var includeTags;
    // chrome.storage.sync.get("includeTags", function (includeTagsString) {
    //     includeTags = includeTagsString.includeTags;
    // });

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
        console.log("mealieUrl: " + mealieUrl);
        fetch(mealieUrl + "/api/recipes/create-url", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(result => {
                console.log("Result: " + result);
                recipeUrl = mealieUrl + "/recipe/" + result.substring(1, result.length - 1);;
                status.innerHTML = "Recipe imported. <a href='" + recipeUrl + "'>Open recipe in mealie</a>";
                status.addEventListener("click", function () {
                    chrome.tabs.create({ url: recipeUrl });
                });
                status.style.backgroundColor = "green";
            })
            .then(function () {
                setTimeout(function () {
                    window.close();
                }, 5000);
            })
            .catch(error => {
                status.innerHTML = "Error importing recipe: " + error;
                status.style.backgroundColor = "red";
                console.log('error', error)
            });
    });
}

//Restore saved preferences
var token = getSavedToken();
//Restore mealie url from storage
var mealieUrl = getSavedMealieUrl();

importRecipe();