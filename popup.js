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

function getBasicHeaders() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    return myHeaders;
}

function actuallyImportRecipe(urlToImport) {
    //Restore includeTags from storage
    var includeTags;
    chrome.storage.sync.get("includeTags", function (includeTagsString) {
        includeTags = includeTagsString.includeTags;
    });

    myHeaders = getBasicHeaders();
    var raw = JSON.stringify({
        "url": urlToImport,
        "includeTags": includeTags
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
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(result => {
            console.log("Result: " + result);
            recipeUrl = mealieUrl + "/recipe/" + result;
            // recipeUrl = mealieUrl + "/recipe/" + result.substring(1, result.length - 1);
            status.innerHTML = "Recipe imported. <a href='" + recipeUrl + "'>Open recipe in mealie</a>";
            status.addEventListener("click", function () {
                chrome.tabs.create({ url: recipeUrl });
            });
            status.style.backgroundColor = "green";
        })
        // .then(function () {
        //     setTimeout(function () {
        //         window.close();
        //     }, 5000);
        // })
        .catch(error => {
            status.innerHTML = "Error importing recipe: " + error;
            status.style.backgroundColor = "red";
            console.log('error', error)
        });
}


function importRecipe() {
    //Restore saved preferences
    token = getSavedToken();
    //Restore mealie url from storage
    mealieUrl = getSavedMealieUrl();



    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var urlToImport;
        urlToImport = tabs[0].url;
        console.log("Tabs url: " + urlToImport);

        myHeaders = getBasicHeaders();
        var status = document.getElementById("status");

        //Get the recipe id from the url
        const recipeId = urlToImport.substring(urlToImport.lastIndexOf('/') + 1) + "-recipe";
        console.log("Recipe id: " + recipeId);


        //Update message to show that we're checking if the recipe exists
        status.innerHTML = "Checking if recipe exists...";
        //Fetch to see if the recipe exists
        var url = mealieUrl + "/api/recipes/" + recipeId;
        fetch(url, { method: "GET", headers: myHeaders })
            .then(function (response) {
                console.log("Response: " + response);
                if (response.status == 200) {
                    //Recipe exists, ask if we need to import it again
                    console.log("Recipe already exists");
                    var confirmImport = confirm("Recipe already exists. Do you want to import it again?");
                    if (confirmImport) {
                        actuallyImportRecipe(urlToImport);
                    } else {
                        //Don't import the recipe
                        status.innerHTML = "Recipe not imported";
                    }
                } else {
                    actuallyImportRecipe(urlToImport);
                }
            });
    });
}



//Restore saved preferences
var token = getSavedToken();
//Restore mealie url from storage
var mealieUrl = getSavedMealieUrl();

importRecipe();