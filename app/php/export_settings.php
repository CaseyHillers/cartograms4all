
<?php

    if(!empty($_POST['name'])){
        $session_file_name = "settings/";
        $session_id = $GET['name'];
        $session_file_name .= ($session_id .= ".json");
        $session_file_string = file_get_contents($session_file_name);
        echo json_encode($session_file_string);
    }else{
        return null;
    }
?>
