document.getElementById("getTokenButton").addEventListener("click", getToken);


//TODO store all of these in a single storage
//Restore saved preferences
chrome.storage.sync.get("accessToken", function (accessTokenString) {
    var json = JSON.parse(accessTokenString.accessToken);
    document.getElementById("token").value = json["access_token"];
});

//Restore mealie url from storage
chrome.storage.sync.get("mealieUrl", function (mealieUrlString) {
    document.getElementById("mealieUrl").value = mealieUrlString.mealieUrl;
});
//Restore includeTags from storage
chrome.storage.sync.get("includeTags", function (includeTagsString) {
    document.getElementById("includeTags").checked = includeTagsString.includeTags;
});


//Store mealieUrl in chrome storage
document.getElementById("mealieUrl").addEventListener("change", function () {
    chrome.storage.sync.set({ "mealieUrl": document.getElementById("mealieUrl").value });
});

//Store includeTags in chrome storage
document.getElementById("includeTags").addEventListener("change", function () {
    chrome.storage.sync.set({ "includeTags": document.getElementById("includeTags").checked });
});

function getToken() {
    //Check that mealieUrl is set
    var mealieUrl = document.getElementById("mealieUrl").value;
    if (mealieUrl == "") {
        alert("Please enter a Mealie url");
        return;
    }

    //Check that user name is set
    var userName = document.getElementById("username").value;
    if (userName == "") {
        alert("Please enter a user name");
        return;
    }

    //Check that password is set
    var password = document.getElementById("password").value;
    if (password == "") {
        alert("Please enter a password");
        return;
    }

    //TODO get parameters from inputs
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", document.getElementById("username").value);
    urlencoded.append("password", document.getElementById("password").value);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch(mealieUrl + "/api/auth/token", requestOptions)
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