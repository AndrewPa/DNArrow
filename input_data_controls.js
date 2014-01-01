function parseVerifyCoord(targ_coord,cur_arm) {
	//RegExp indicating coordinate begins with a redundant chromosome arm label
	var re_apfx = new RegExp("^[2-3](L|R):");
	//RegExp indicating body of entered coordinate is in the valid format
	var re_bcor = new RegExp("(((^[1-9]\\d+|^[0-9])--([1-9]\\d+|[1-9]))|(^[1-9]\\d+|^[0-9]));"  + 
                             "((([1-9]\\d+|[1-9])--([1-9]\\d+$|[1-9]$))|([1-9]\\d+$|[1-9]$))","g");

	//Step 1: Broader parsing, verifying that basic format is correct
	if (targ_coord.match(re_apfx)) {
		if (targ_coord.slice(0,2) !== cur_arm) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>Please ensure each entry's prefix is either blank or the same as " +
			"the one you selected in the chromosome arm selection panel.</p>");

			return false;
		}
		else {
			targ_coord = targ_coord.slice(3,targ_coord.length);
		}
	}

	if(!targ_coord.match(re_bcor)) {
		displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" + 
		"<p> Please ensure that each coordinate is in the correct format." + "</p>" +
    	format_alert);

		return false;
	}

	//Step 2: Deeper parsing, verifying that specific features of entered data make sense
	var lft = targ_coord.split(";")[0];
	var rgt = targ_coord.split(";")[1];
	var lft_most = lft.split("--")[0];
	if (rgt.split("--")[1] !== undefined) {
		var rgt_most = rgt.split("--")[1];
	}
	else {
		var rgt_most = rgt;
	}

	if (lft !== lft_most) {       //If there is a left-hand breakpoint
		lft = lft.split("--")[1]; //Then take the right-hand part of the left coordinate
                                  //as the end of the lefthand uncertain breakpoint range
		if (Number(lft_most) > Number(lft)) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>Uncertain breakpoints must be typed left to right (lowest position to highest position).</p>" +
			format_alert);
	
			return false;
		}
		if (Number(lft_most) === Number(lft)) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>You cannot define a left breakpoint region of zero length.</p>" +
			format_alert);

			return false;
		}
	}
	else {
		lft_most = 0; //Indicates that there is no lefthand uncertain breakpoint
	}

	if (rgt !== rgt_most) {       //Likewise for the right-hand breakpoint
		rgt = rgt.split("--")[0]; //except now take the left-hand part of the right coordinate
                                  //as the beginning of the righthand uncertain breakpoint range
		if (Number(rgt) > Number(rgt_most)) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>Uncertain breakpoints must be typed left to right (lowest position to highest position).</p>" +
			format_alert);

			return false;
		}
		if (Number(rgt) === Number(rgt_most)) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>You cannot define a right breakpoint region of zero length.</p>" +
			format_alert);

			return false;
		}
	}
	else {
		rgt_most = 0; //Indicates that there is no righthand uncertain breakpoint
	}

	if (Number(lft) > Number(rgt)) {
		displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
		"<p>Coordinates must be typed left to right (lowest position to highest position).</p>" +
		format_alert);

		return false;
	}
	if (lft === rgt) {
		displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
		"<p>You cannot define a region of zero length.</p>" +
		format_alert);

		return false;
	}
	return {
		"lft_most": lft_most,
		"lft": lft,
		"rgt": rgt,
		"rgt_most": rgt_most,
		"str_id": lft_most + "--" + lft + ";" + rgt + "--" + rgt_most
	};
}

function getInterval(coord,interval) {
	if (interval === "largest") {
		if (coord["lft_most"] !== 0) {
			left = coord["lft_most"];
		}
		else {
			left = coord["lft"];
		}
		if (coord["rgt_most"] !== 0) {
			right = coord["rgt_most"];
		}
		else {
			right = coord["rgt"];
		}
	}
	else if (interval == "smallest") {
		left = coord["lft"];
		right = coord["rgt"];
	}
	return left + ";" + right;
}

function submitCoordinates(type) {
	var coordform = preloaded[type + "_input"];

	if(coordform.value == false) {
		alert("Please enter a value.");
		coordform.value = "";

		return false;
	}

	var cur_arm = button_states.arm_panel.prev_label.substr(8,9);

	if (type === "act") {
		var cur_type = button_states.e_s_panel.prev_label.substr(0,3);
	}
	else if (type ==="ina") {
		var cur_type = type;
	}

	var new_coords = coordform.value.trim().split(" ");

	//Removes whitespace between coordinate entries, which may result from copy-pasting data
	new_coords = new_coords.filter(function(element) { if(element !== "") { return true; }});

	var cur_array = preloaded.dataset[cur_arm][cur_type]["full"];
	var passed_array = preloaded.dataset[cur_arm][cur_type]["passed"];
	var rem_array = preloaded.dataset[cur_arm][cur_type]["pre_rem"];
	var col_array = preloaded.dataset[cur_arm][cur_type]["pre_col"];
	var validated = [];

	//Removes whitespace between coordinate entries, which may result from copy-pasting data
	new_coords = new_coords.filter(function(element) { if(element !== "") { return true; }});

	for (cur_coord in new_coords) {
		var parsed_coord = parseVerifyCoord(new_coords[cur_coord],cur_arm);

		if (parsed_coord !== false) {
			if (passed_array.indexOf(parsed_coord.str_id) === -1) {
				validated.push(parsed_coord);
			}
		}
		else {
			return false;
		}
	}
	
	for (val_coord in validated) {
		cur_array.push(validated[val_coord]);
		passed_array.push(validated[val_coord]["str_id"]);
		rem_array.push(getInterval(validated[val_coord],"largest"));

		if (cur_type === "sup" || cur_type == "enh") {
			col_array.push(getInterval(validated[val_coord],"largest"));
		}
		else if (cur_type == "ina") {
			col_array.push(getInterval(validated[val_coord],"smallest"));
		}
	}

	var target_listbox = preloaded[type + "box"];

	buildListbox(cur_arm,cur_type,target_listbox);
	coordform.value = "";

	return true;
}

function deleteItem(targ_array,targ_item) {
	delete targ_array[targ_array.indexOf(targ_item)];
	targ_array.sort();
	targ_array.pop();
}

//In lieu of an MVC framework, deleting coordinates manually is the inverse function of submitCoordinates()
function deleteCoordinate(type) {
	var coordform = preloaded[type + "box"];

	if(coordform[coordform.selectedIndex] === undefined) {
		return false;
	}

	var cur_arm = button_states.arm_panel.prev_label.substr(8,9);

	if (type === "act") {
		var cur_type = button_states.e_s_panel.prev_label.substr(0,3);
	}
	else if (type === "ina") {
		var cur_type = type;
	}

	var cur_array = preloaded.dataset[cur_arm][cur_type]["full"];
	var passed_array = preloaded.dataset[cur_arm][cur_type]["passed"];
	var rem_array = preloaded.dataset[cur_arm][cur_type]["pre_rem"];
	var col_array = preloaded.dataset[cur_arm][cur_type]["pre_col"];
	var to_remove_name = coordform[coordform.selectedIndex].value;

	for (full_coord in cur_array) {
		if (cur_array[full_coord]["str_id"] === to_remove_name) {
			var full_delete = cur_array[full_coord];
			break;
		}
	}

	var rem_delete = getInterval(full_delete,"largest");

	if (cur_type === "sup" || cur_type == "enh") {
		var col_delete = rem_delete.slice();
	}
	else if (cur_type === "ina") {
		var col_delete = getInterval(full_delete,"smallest");
	}

	deleteItem(cur_array,full_delete);
	deleteItem(passed_array,to_remove_name);
	deleteItem(rem_array,rem_delete);
	deleteItem(col_array,col_delete);

	buildListbox(cur_arm,cur_type,coordform);

	preloaded.remaining_textbox.value = "";
	preloaded.collapse_textbox.value = "";

	return true;
}

function deleteAllInput(type) {
	if(type === "enh" || type === "sup") {
		var coordform = preloaded["actbox"];
	}
	else if (type === "ina") {
		var coordform = preloaded["inabox"];
	}
	var cur_arm = button_states.arm_panel.prev_label.substr(8,9);
	var cur_type = type;

	preloaded.dataset[cur_arm][cur_type]["full"] = [];
	preloaded.dataset[cur_arm][cur_type]["passed"] = [];
	preloaded.dataset[cur_arm][cur_type]["pre_rem"] = [];
	preloaded.dataset[cur_arm][cur_type]["pre_col"] = [];

	buildListbox(cur_arm,cur_type,coordform);

	preloaded.remaining_textbox.value = "";
	preloaded.collapse_textbox.value = "";

	return true;
}