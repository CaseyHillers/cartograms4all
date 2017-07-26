// sets flags when writing the user's current CSV to the server
function saveSession() {
    saveFlag = true;
    init();
    saveFlag = false;
}

// sets flags and file name when loading current user's CSV from server
function loadMySession() {
    loadingFlag = true;
    serverDownloadFlag = true;
    userUploadFlag = false;
    nameOfLoadFile = USER_DIRECTORY + userSessionID + ".csv";
    init();
}

// sets flags and file name when loading other user's CSV from server
function loadOtherSession() {
    loadingFlag = true;
    serverDownloadFlag = true;
    userUploadFlag = false;
    init();
}

// loads the session ID into sharing form
function shareSessionID(element) {
    if (userSessionID != null) element.value = userSessionID;
}

// gets a session ID from user and uses it to load the corresponding user's CSV
document.getElementById('paste_session_id').onkeydown = function(event) {
    var e = event || windows.event;
    if (e.keyCode == 13) {
        nameOfLoadFile = USER_DIRECTORY + document.getElementById('paste_session_id').value + ".csv"; // gets the session_id from the form for accessing other user's CSV's
        loadOtherSession(); // set flags and file name
    }
}

function generateSessionID(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';

    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// writes string_to_save to app/php/settings/<session_id>.json
function writeToServer(session_id, string_to_save) {
    var XHR; 
    var data = new FormData();
    data.append("data", string_to_save);
    data.append("name", session_id);
    if (window.XMLHttpRequest) {
      XHR = new XMLHttpRequest();
    } else {
      XHR = new activeXObject("Microsoft.XMLHTTP");
    }
    XHR.open('post', PHP_DIRECTORY + 'importSettings.php', true);
    XHR.send(data);
}

// returns contents from app/php/settings/<session_id>.json as a string
function readFromServer(session_id) {
    var XHR;
    var return_string;
    var data = new FormData();
    data.append("name", session_id);
    if (window.XMLHttpRequest) {
      XHR = new XMLHttpRequest();
    } else {
      XHR = new activeXObject("Microsoft.XMLHTTP");
    }
    //XHR.responseType = 'text';
    XHR.onload = function() {
        if (XHR.readyState === XHR.DONE) {
            return_string = XHR.responseText;
        }
    }
    XHR.open('post', PHP_DIRECTORY + 'exportSettings.php', false);
    XHR.send(data);
    return return_string;
}

//Import cookie information through an API that reads the content of sessionId.json
//After importing, it will try to pull out the critical information like file/settings
//It then sets it for the user
function importUserSettings(sessionId) {
    //call API
    var jsonString = readFromServer(sessionId); // jsonString is read in from the correct file in php/settings folder
    //Set value of userObj (global)
    userObj = JSON.parse(jsonString);
    userData = userObj['fileName'];
    init(); //refresh the view
}

//Export cookie information and call API to write file as sessionId.json
function exportUserSettings() {
    createCookie("fileName", userData, 30, "/");
    var userCookieJson = exportCookie(); // a string representation of the JSON
    var session_id = readCookie('userSessionCookie'); // session_id is read from the cookie

    //CALL API to write the cookie information into settings/<session_id>.json
    writeToServer(session_id, userCookieJson);
}

//Save CSV to uploader/upload path via an ajax call
//The saved CSV can be use for other user as it is public
function saveByFile(userCSV) {
    var data = new FormData();
    data.append("input_csv", userCSV);
    data.append("name", userCSV.name)
    data.append("session_id", userSessionID);

    $.ajax({
        url: UPLOAD_DIRECTORY + 'uploadManager.php',
        type: 'POST',
        data: data,
        cache: false,
        processData: false, // Don't process the files
        contentType: false, // jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // TODO: Process the form
                //submitForm(event, data);
            } else {
                // TODO: Handle errors here
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
    haveSavedFlag = true;
}

//Save CSV to uploader/upload path via an ajax call
//The saved CSV can be use for other user as it is public
function saveByName() {
    var XHR;
    var data = new FormData();
    data.append("userID", userSessionID);
    data.append("otherFileName", nameOfLoadFile);
    if (window.XMLHttpRequest) {
      XHR = new XMLHttpRequest();
    } else {
      XHR = new activeXObject("Microsoft.XMLHTTP");
    }
    XHR.open('post', PHP_DIRECTORY + 'saveByName.php', true);
    XHR.send(data);
    haveSavedFlag = true;
}
