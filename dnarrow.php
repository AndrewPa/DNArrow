<?php
	mysql_connect("localhost", "dnarrowadmin", "") or die(mysql_error());
	mysql_select_db("dnarrow_users") or die(mysql_error());

	if(isset($_COOKIE['ID_my_site'])) {
		$username = $_COOKIE['ID_my_site'];
		$pass = $_COOKIE['Key_my_site'];
		$check = mysql_query("SELECT * FROM registered_users WHERE username = '$username'")or die(mysql_error());

		while($info = mysql_fetch_array( $check )) {
			if ($pass != $info['password']) {
				header("Location: index.php");
			}
		}
	}
	else {
		header("Location: index.php");
	}

    echo "<div id='loading_data'>
              <h2>Welcome to DNArrow 2.1</h2>
              <h5>(c) Andrew Papadopoli 2014</h5>
              <p>Loading experimental results from database, please wait...</p>
          </div>";

	$username = "dnarrowadmin";
	$password = "";
	$server = "localhost";
	$database = "dnarrow";
	$chro_arms = array("2L","2R","3L","3R");
	$res_types = array("sup","enh","x");

	$mysqlconnection = mysql_connect($server, $username, $password);
	if (!$mysqlconnection) {
		die('There was a problem connecting to the MySQL server. Error given: '. mysql_error());
	}

	$databaseconnection = mysql_select_db($database, $mysqlconnection);
	if (!$databaseconnection) {
		die('There was a problem selecting the MySQL database. Error given: '. mysql_error());
	}

	function loadResult($arm,$type) {
		$full_result = array();
		$data = mysql_query(
			"SELECT lft_most, lft, rgt, rgt_most, " .
			"CONCAT(lft_most,'--',lft,';',rgt,'--',rgt_most) AS str_id " . //ID used later to ensure no duplicate coord data for different stocks 
			"FROM dmel_data " .
			"WHERE arm = '$arm' " .
				"AND res_type = '$type' " .
				"AND best = 'true' " .
				"AND lft != 0 " . //Some results have no associated coordinates and cannot be analyzed here
				"AND rgt != 0"
		)
		or die('There was a problem selecting columns from the table. Error given: '. mysql_error());
		while($info = mysql_fetch_array($data)) {
			array_push($full_result,$info);
		}
		return $full_result;
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
			$pre_JSON_data[$chro_arm][$res_type]["full"] = loadResult($chro_arm,$res_type);
			$pre_JSON_data[$chro_arm][$res_type]["pre_rem"] = getInterval("smallest",$chro_arm,$res_type);
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
	include("dnarrow.html");
	echo "<style>
			  textarea {
			      resize: none;
			      width: 270px;
			      height: 225px;
			      display: block;
			      font: 10pt arial, sans-serif;
			  }
			  input {
			      width: 270px;
			      display: block;
			  }
		  </style>"
?>

<script>
	databaseOptions = showDatabaseOptions;
</script>
