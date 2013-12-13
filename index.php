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

	$mysqlconnection = mysql_connect($server, $username, $password);
	if (!$mysqlconnection) {
		die('There was a problem connecting to the MySQL server. Error given: '. mysql_error());
	}

	$databaseconnection = mysql_select_db($database, $mysqlconnection);
	if (!$databaseconnection) {
		die('There was a problem selecting the MySQL database. Error given: '. mysql_error());
	}
	
	function loadArm($arm) {
		$data = mysql_query("SELECT stk, sym, lft_most, lft, rgt, rgt_most FROM dmel_data WHERE arm = '$arm'")
		or die('There was a problem selecting columns from the table. Error given: '. mysql_error());
		while($info = mysql_fetch_array($data)) {
			$stk_sym = "STK" . $info['stk'] . "SYM" . $info['sym'];
			$coordinates = array((int)$info['lft_most'],(int)$info['lft'],(int)$info['rgt'],(int)$info['rgt_most']);
			$pre_JSON[$stk_sym] = $coordinates;
		}
		return JSON_encode($pre_JSON);
	}

	$JSON2L = loadArm("2L");
	$JSON2R = loadArm("2R");
	$JSON3L = loadArm("3L");
	$JSON3R = loadArm("3R");
?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>DNArrow 2.1 (c) Andrew Papadopoli 2013</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<!--Passing JSON Objects from PHP to JS-->
		<script>
			var JSON2L = <?php echo $JSON2L ?>;
			var JSON2R = <?php echo $JSON2R ?>;
			var JSON3L = <?php echo $JSON3L ?>;
			var JSON3R = <?php echo $JSON3R ?>;
		</script>
		<!--Third-Party Scripts-->
		<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.3.dialog.min.js"></script>
		<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.10.3.custom.css" media="screen" />
		<!--My Scripts-->
		<link rel="stylesheet" type="text/css" href="css/dnarrow-layout.css" media="screen" />
		<script type="text/javascript" src="main.js"></script>
		<script type="text/javascript" src="input_parsing.js"></script>
		<script type="text/javascript" src="display_controls.js"></script>
		<script type="text/javascript" src="all_algorithms.js"></script>
		<script type="text/javascript" src="algorithm_class.js"></script>
	</head>
	<body>
		<div class="topbar">
			<h2>Welcome to DNArrow 2.1</h2>
			<h5>(c) Andrew Papadopoli 2014
			<h4>
				Please enter your coordinates. <a class="ins-link" onclick="showInstructions();">See detailed instructions here.</a>
			</h4>
			<h4>Select Chromosome Arm to Analyze:
				<select id="chrom_arm" onchange="buildListbox();">
					<option value="2L">2L</option>
					<option value="2R">2R</option>
					<option value="3L">3L</option>
					<option value="3R">3R</option>
	           	</select>
			</h4>
		</div>
		<div class="appspace">
			<div id="sup_data_group" class="data-group">
				<div class="title-bar">
					Active
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear(preloaded.supbox,sup_arrays);" role="button" aria-disabled="false" title="Clear All">
	    				<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<select class="listbox" id="sup_coordslist" size="10" onkeypress="if(event.keyCode==46)(deleteCoordinate(preloaded.supbox,sup_arrays));"></select>
					<input id="sup_input" type="text" placeholder="e.g.: 100;200 200;300" 
					onkeypress="if(event.keyCode==13)(submitCoordinate('sup_input',preloaded.supbox,sup_arrays));">
					<!--Design Consideration: Keep or remove input list buttons-->
					<!--<button class="single add" type="submit" onClick="submitCoordinate('sup_input',preloaded.supbox,sup_arrays);">Add</button>
					<button class="single delete" type="delete_sup" onClick="deleteCoordinate(preloaded.supbox,sup_arrays);">Delete</button>-->
				</div>
			</div>
			<div id="neu_data_group" class="data-group">
				<div class="title-bar">
					Inactive
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear(preloaded.neubox,neu_arrays);" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<select class="listbox" id="neu_coordslist" size="10" onkeypress="if(event.keyCode==46)(deleteCoordinate(preloaded.neubox,neu_arrays));"></select>
					<input id="neu_input" type="text" placeholder="e.g.: 100;200 200;300" 
					onkeypress="if(event.keyCode==13)(submitCoordinate('neu_input',preloaded.neubox,neu_arrays));">
					<!--Design Consideration: Keep or remove input list buttons-->
					<!--<button class="single add" type="submit" onClick="submitCoordinate('neu_input',preloaded.neubox,neu_arrays);">Add</button>
					<button class="single delete" type="delete_sup" onClick="deleteCoordinate(preloaded.neubox,neu_arrays);">Delete</button>-->
				</div>
			</div>
			<div id="rem_data_group" class="data-group">
				<div class="title-bar">
					Remaining
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear(preloaded.remaining_textbox);" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data">
					<textarea id="remaining_textbox"></textarea>
					<button class="single algorithm" type="submit" onClick="newremaining.algorithm();">Remaining</button>
				</div>
			</div>
			<div id="col_data_group" class="data-group">
				<div class="title-bar">
					Collapse
					<button class="ui-button ui-state-default ui-button-icon-only single clear" onclick="confirmClear(preloaded.collapse_textbox);" role="button" aria-disabled="false" title="Clear All">
    					<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
					</button>
				</div>
				<div class="input-data results">
					<textarea id="collapse_textbox"></textarea>
					<button class="single algorithm" type="submit" onClick="newcollapse.algorithm();">Collapse</button>
				</div>
			</div>
		</div>
		<div id="det_ins" title="Detailed Instructions"></div>
		<div id="dialog-confirm"></div>
	</body>
</html>