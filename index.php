<?php
    echo "<div id='loading_data'>
              <h2>Welcome to DNArrow 2.1</h2>
              <h5>(c) Andrew Papadopoli 2014</h5>
              <p>Loading experimental results from database, please wait...</p>
          </div>";

	$username = "dnarrowadmin";
	$password = "walkersss";
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

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>DNArrow 2.1 (c) Andrew Papadopoli 2014</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<!--Passing JSON Object from PHP to JS-->
		<script>
			var JSON_data = <?php echo $JSON_data ?>;
		</script>
		<!--Third-Party Scripts-->
		<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.3.dialog.min.js"></script>
		<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.10.3.custom.css" media="screen" />
		<!--My Scripts-->
		<link rel="stylesheet" type="text/css" href="css/dnarrow-layout.css" media="screen" />
		<script type="text/javascript" src="main.js"></script>
		<script type="text/javascript" src="input_data_controls.js"></script>
		<script type="text/javascript" src="display_controls.js"></script>
		<script type="text/javascript" src="all_algorithms.js"></script>
		<!--<script type="text/javascript" src="algorithm_class.js"></script>-->
	</head>
	<body>
		<div class="topbar">
			<h2>DNArrow 2.1</h2>
			<h5>(c) Andrew Papadopoli 2014
			<h4>
				<a class="ins-link" onclick="showInstructions();">See detailed instructions here.</a>
			</h4>
			<h4>
				<div class="choose-box arm-box" onclick="radioSelector('arm_panel','arm_box_2L')">
					<span class="choose-box-label arm-box-label">2L</span>
				</div>
				<div class="choose-box arm-box" onclick="radioSelector('arm_panel','arm_box_2R')">
					<span class="choose-box-label arm-box-label">2R</span>
				</div>
				<div class="choose-box arm-box" onclick="radioSelector('arm_panel','arm_box_3L')">
					<span class="choose-box-label arm-box-label">3L</span>
				</div>
				<div class="choose-box arm-box" onclick="radioSelector('arm_panel','arm_box_3R')">
					<span class="choose-box-label arm-box-label">3R</span>
				</div>
				<!--<select id="chrom_arm" onchange="buildListbox();">
					<option value="2L">2L</option>
					<option value="2R">2R</option>
					<option value="3L">3L</option>
					<option value="3R">3R</option>
				</select>-->
			</h4>
			<h4>
				<div class="choose-box sup-enh-toggle" onclick="radioSelector('e_s_panel','enh_toggle')">
					<span class="choose-box-label sup-enh-toggle-label">E</span>
				</div>
				<div class="choose-box sup-enh-toggle" onclick="radioSelector('e_s_panel','sup_toggle')">
					<span class="choose-box-label sup-enh-toggle-label">S</span>
				</div>
				<button class="ui-button ui-state-default ui-button-icon-only single load" onclick="window.alert('Not yet implemented!');" role="button" aria-disabled="false" title="Load Data">
					<span class="ui-button-icon-primary ui-icon ui-icon-plusthick"></span>
				</button>
			</h4>
		</div>
		<div class="appspace">
			<div id="sup_data_group" class="data-group">
				<div class="title-bar">
					<span id="active_title" class="title-bar-text">Active</span>
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear('act');" role="button" aria-disabled="false" title="Clear All">
	    				<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<select class="listbox displaybox" id="sup_coordslist" size="10" onkeypress="if(event.keyCode==46)(deleteCoordinate('act'));"></select>
					<input id="act_input" type="text" placeholder="e.g.: 1000000--2000000;3000000--4000000" 
					onkeypress="if(event.keyCode==13)(submitCoordinates('act'));">
				</div>
			</div>
			<div id="neu_data_group" class="data-group">
				<div class="title-bar">
					<span class="title-bar-text">Inactive</span>
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear('ina');" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<select class="listbox displaybox" id="neu_coordslist" size="10" onkeypress="if(event.keyCode==46)(deleteCoordinate('ina'));"></select>
					<input id="ina_input" type="text" placeholder="e.g.: 1000000--2000000;3000000--4000000" 
					onkeypress="if(event.keyCode==13)(submitCoordinates('ina'));">
				</div>
			</div>
			<div id="rem_data_group" class="data-group">
				<div class="title-bar">
					<span class="title-bar-text">Remaining</span>
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear('rem');" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<textarea class="displaybox" id="remaining_textbox"></textarea>
					<button class="ui-button ui-state-default ui-button-icon-only single play" onclick="AllAlgorithms.computeRemaining();" role="button" aria-disabled="false" title="Run Algorithm">
	    				<span class="ui-button-icon-primary ui-icon ui-icon-play"></span>
					</button>
				</div>
			</div>
			<div id="col_data_group" class="data-group">
				<div class="title-bar">
					<span class="title-bar-text">Collapse</span>
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear('col');" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data results">
					<textarea class="displaybox" id="collapse_textbox"></textarea>
					<button class="ui-button ui-state-default ui-button-icon-only single play" onclick="AllAlgorithms.collapseCoords();" role="button" aria-disabled="false" title="Run Algorithm">
	    				<span class="ui-button-icon-primary ui-icon ui-icon-play"></span>
					</button>
				</div>
			</div>
		</div>
		<div id="det_ins" title="Detailed Instructions"></div>
		<div id="warning_text" title="Notification"></div>
		<div id="dialog-confirm"></div>
	</body>
</html>