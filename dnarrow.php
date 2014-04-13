<?php
    session_start();

    if(!isset($_SESSION['valid']) || !$_SESSION['valid']) {
        header("Location: index.php");
        die();
    }
?>
    <!-- Loading page -->
    <div id='loading_data'>
        <h2>Welcome to DNArrow 2.1</h2>
        <h5>(c) Andrew Papadopoli 2014</h5>
        <p>Loading experimental results from database, please wait...</p>
    </div>

<?php
    $chro_arms = array("2L","2R","3L","3R");
    $res_types = array("sup","enh","x");

    include "private/credentials.php";

    $db = new PDO('mysql:host=localhost;dbname=dnarrowx_dmelres;charset=utf8',
        $credentials["userlab"]["id"], $credentials["userlab"]["pass"]);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    try {
        $stmt = $db->prepare(
            "SELECT lft_most, lft, rgt, rgt_most, " .
            "CONCAT(lft_most,'--',lft,';',rgt,'--',rgt_most) AS str_id " .
            //ID used later to ensure no duplicate coord data for different stocks 
            "FROM dmel_data " .
            "WHERE arm = ? " .
            "AND res_type = ? " .
            "AND best = 'true' " .
            "AND lft != 0 " .
            //Some results have no associated coordinates and cannot be analyzed
            "AND rgt != 0");
    }
    catch(PDOException $ex) {
        echo "There was a problem accessing the user database: " .
            $ex->getMessage();
    }

    function loadResult($arm, $type) {
        global $stmt;
        try {
            $stmt->execute(array($arm, $type));
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        catch(PDOException $ex) {
            echo "There was a problem accessing the user database: " .
                $ex->getMessage();
        }
    }

    $pre_JSON_data = array();

    //Chooses the breakpoint interval to be used for future algorithms
    //depending on the data type and algorithm
    function getInterval($interval,$chro_arm,$res_type) {
        global $pre_JSON_data;
        $f_results = $pre_JSON_data[$chro_arm][$res_type]["full"];
        $return_array = array();

        if ($interval == "largest") {
            foreach ($f_results as $f_res) {
                if ($f_res["lft_most"] != 0) {
                    $left = $f_res["lft_most"];
                }
                else {
                    $left = $f_res["lft"];
                }
                if ($f_res["rgt_most"] != 0) {
                    $right = $f_res["rgt_most"];
                }
                else {
                    $right = $f_res["rgt"];
                }
                $used_interval = $left . ";" . $right;
                array_push($return_array,$used_interval);
            }
        }
        else if ($interval == "smallest") {
            foreach ($f_results as $f_res) {
                $left = $f_res["lft"];
                $right = $f_res["rgt"];

                $used_interval = $left . ";" . $right;
                array_push($return_array,$used_interval);
            }
        }
        return $return_array;
    }

    //For algorithm "remaining":
    //Active regions ("sup" and "enh") are assumed to be associated with their smallest intervals
    //Inactive regions ("x" or "ina") are assumed to be associated with their smallest intervals
    foreach ($chro_arms as $chro_arm) {
        foreach ($res_types as $res_type) {
            $pre_JSON_data[$chro_arm][$res_type]["full"] = loadResult($chro_arm, $res_type);
            $pre_JSON_data[$chro_arm][$res_type]["pre_rem"] = getInterval("smallest", $chro_arm, $res_type);
            $pre_JSON_data[$chro_arm][$res_type]["passed"] = array();
        }
    }
    //For algorithm "collapse":
    //Active regions ("sup" and "enh") are assumed to be associated with their largest intervals
    //Inactive regions ("x" or "ina") are assumed to be associated with their smallest intervals
    foreach ($chro_arms as $chro_arm) {
        $pre_JSON_data[$chro_arm]["sup"]["pre_col"] = getInterval("largest",$chro_arm,"sup");
        $pre_JSON_data[$chro_arm]["enh"]["pre_col"] = getInterval("largest",$chro_arm,"enh");
        $pre_JSON_data[$chro_arm]["x"]["pre_col"] = getInterval("smallest",$chro_arm,"x");
    }

    $JSON_data = JSON_encode($pre_JSON_data);
?>

    <script>
        //Passing JSON Object from PHP to JS
        var JSON_data = <?php echo $JSON_data ?>;
    </script>

<?php
    include "dnarrow.html";
?>

    <!-- If loaded in registered mode, database options displayed instead of
    offline notification -->
    <script>
	databaseOptions = showDatabaseOptions;
    </script>
