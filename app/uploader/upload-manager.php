<?php
header('Access-Control-Allow-Origin: *');
// Check if the form was submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){
    // Check if file was uploaded without errors
    if(isset($_FILES["input_csv"]) && $_FILES["input_csv"]['error'] == 0){
    
       // Verify file size - 5MB maximum
       //$maxsize = 5 * 1024 * 1024;
       // if($filesize > $maxsize) die("Error: File size is larger than the allowed limit.");
    
       // Check whether file exists before uploading it
        if(file_exists("upload/" . $_FILES["input_csv"]["name"])){
          echo $_FILES["input_csv"]["name"] . " is already exists.";
        } else{
            if (move_uploaded_file($_FILES["input_csv"]["tmp_name"], "upload/" . $_FILES["input_csv"]["name"])){
              echo "Your file was uploaded successfully.";

            } else {
                  echo "upload fail";
                  print_r($_FILES);
	    }
        }    
     } else{
        die("Error: " . $_FILES["input_csv"]["error"]);
    }
}

function writeToFile(){
  if(!empty($_POST['data'])){
    $settings_string = $_POST['data'];
    $session_file_name = "settings/";
    $session_id = $_POST['name'];
    $session_file_name .= ($session_id .= ".json");
    file_put_contents($session_file_name, $settings_string);
  }
}

function readFromFile($csvName){
  $session_file_name = "upload/";
  $session_id = $_POST['session_id'];
  $session_file_name .= ($session_id .= ".json");
  $session_file_string = file_get_contents($session_file_name);
  echo ($session_file_string);
}
?>




