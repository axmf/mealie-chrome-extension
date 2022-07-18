document.getElementById("importRecipeButton").addEventListener("click", importRecipe);
document.getElementById("getTokenButton").addEventListener("click", getToken);

//Restore saved preferences
chrome.storage.sync.get("accessToken", function (accessTokenString) {
    var json = JSON.parse(accessTokenString.accessToken);
    document.getElementById("token").value = json["access_token"];
});

//Restore mealie url from storage
chrome.storage.sync.get("mealieUrl", function (mealieUrlString) {
    document.getElementById("mealieUrl").value = mealieUrlString.mealieUrl;
});


//Store mealieUrl in chrome storage
document.getElementById("mealieUrl").addEventListener("change", function () {
    chrome.storage.sync.set({ "mealieUrl": document.getElementById("mealieUrl").value });
});

function getToken() {
    let mealieUrl = document.getElementById("mealieUrl").value;
    //TODO get parameters from inputs
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();


    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("http://docker.home:9920/api/auth/token", requestOptions)
        .then(response => response.text())
        .then(result => {

            var key = "accessToken";
            var jsonfile = {};
            jsonfile[key] = result;
            chrome.storage.sync.set(jsonfile, function () {
                document.getElementById("token").value = JSON.parse(result)['access_token'];
                console.log('Saved', key, result);
            });


        })
        .catch(error => console.log('error', error));
}

function importRecipe() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var urlToImport;
        urlToImport = tabs[0].url;
        console.log("Tabs url: " + urlToImport);

        var myHeaders = new Headers();
    
        myHeaders.append("Authorization", "Bearer " + document.getElementById("token").value);
        myHeaders.append("accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
    
    
        var raw = JSON.stringify({
            "url": urlToImport
        });
    
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
    
        //http://docker.home:9920/api/recipes/create-url
        fetch(document.getElementById("mealieUrl").value, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    });

   
}