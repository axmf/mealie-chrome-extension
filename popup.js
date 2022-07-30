console.log("Popup.js loaded");

//TODO find other ways to detect if the recipe can be parsed

//Get ld+json from the page
function getLdJson() {
    var ldJson = document.getElementsByTagName("script");
    for (var i = 0; i < ldJson.length; i++) {
        if (ldJson[i].type == "application/ld+json") {
            //Check that it has a recipeCategory
            if (ldJson[i].innerHTML.includes("recipeCategory")) {
                return true;
            }
        }
    }
    return false;
}

function importRecipeSchema() {
    var recipeTags = document.getElementsByClassName("recipe");
    if (recipeTags.length > 0) {
        return true;
        var recipe = recipeTags[0];
        var recipeSchema = recipe.innerHTML;
        var recipeSchema = recipeSchema.replace(/\n/g, "");
        var recipeSchema = recipeSchema.replace(/\t/g, "");
        var recipeSchema = recipeSchema.replace(/\r/g, "");
        var recipeSchema = recipeSchema.replace(/\s/g, "");
        var recipeSchema = recipeSchema.replace(/\s+/g, "");
        var recipeSchema = recipeSchema.replace(/<\/?[^>]+(>|$)/g, "");
        var recipeSchema = recipeSchema.replace(/\s+/g, "");
    }
    return false;
}


//Display a message if there are no recipe tags
function displayMessage() {
    var message = document.getElementById("message");
    message.innerHTML = "No recipe tags found";
    message.style.display = "block";
}

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

    //TODO can we do this with active tab only?
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

// if(!getLdJson()) {
    // console.log("No recipe tags found");
    // displayMessage();
// }

importRecipe();