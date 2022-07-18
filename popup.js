document.getElementById("importRecipeButton").addEventListener("click", importRecipe);
document.getElementById("getTokenButton").addEventListener("click", getToken);


function getToken() {
    let mealieUrl = document.getElementById("mealieUrl").value;
    //TODO get parameters from inputs
    // console.log("making request!");
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", "mail@gmail.com");
    urlencoded.append("password", "MyPassword");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("http://docker.home:9920/api/auth/token", requestOptions)
        .then(response => response.text())
        .then(result => {
            var json = JSON.parse(result);
            //json["access_token"]
            var key="accessToken";
            var jsonfile = {};
            jsonfile[key] = result;
            chrome.storage.sync.set(jsonfile, function () {
                console.log('Saved', key, result);
            });

            
        })
        .catch(error => console.log('error', error));

}


var urlToImport;
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    urlToImport = tabs[0].url;
    console.log("Tabs url: " + urlToImport);
});

function importRecipe() {


    var myHeaders = new Headers();

    chrome.storage.sync.get("accessToken", function (jsonTokenResponse) {
        console.log('Value currently is ' + jsonTokenResponse["access_token"]);
        myHeaders.append("Authorization", "Bearer " + jsonTokenResponse["access_token"]);
    });

    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/json");


    var raw = JSON.stringify({
        "url": urlToImport
    });

    console.log(myHeaders);
    console.log(raw);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };


    fetch("http://docker.home:9920/api/recipes/create-url", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}