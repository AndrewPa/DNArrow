function verifyFormat(targ) {
    if(targ.match(/(^[1-9]\d+|^[0-9]);([1-9]\d+$|[1-9]$)/))
    {
    	return 1; //case 1: entry is in the correct format and is processed normally
    }
    else if(targ.match((/^[2-3](L|R):/)))
    {
    	if(targ.slice(0,2) === preloaded.armselect.value)
    	{
    		return 2; //case 2: entry contains redundant chromosome arm label
    	}
    	else
    	{
    		alert("One of your entries is invalid (" + targ +
   			"). Please ensure each entry's prefix is either blank or the same as " +
   			"the one you selected in the chromosome arm drop-down menu.");

    		return false;
    	}
    }
    else
    {
    	re = new RegExp("(((^[1-9]\\d+|^[0-9])--([1-9]\\d+|[1-9]))|(^[1-9]\\d+|^[0-9]));"  + 
    	                "((([1-9]\\d+|[1-9])--([1-9]\\d+$|[1-9]$))|([1-9]\\d+$|[1-9]$))","g");

    	if(targ.match(re))
    	{
            return 3; //case 3: entry contains uncertain breakpoints
    	}
    }
    
    alert("One of your entries is invalid (" + coord_parsed[coord_index] +
    "). Please ensure that each coordinate is in the correct format." + 
    format_alert);
    
    return false; //if the end of the function is reached without returning, no matches were found

}

function parseUncertain(coord,type)
{
	var sides = coord.split(";");
	
	if(type === "sup")
	{
	    sides[0] = Math.min.apply(null,sides[0].split("--"));
	    sides[1] = Math.max.apply(null,sides[1].split("--"));
	    
        return sides.join(";");
    }
	else if(type === "neu")
	{
		sides[0] = Math.max.apply(null,sides[0].split("--"));
		sides[1] = Math.min.apply(null,sides[1].split("--"));

		return sides.join(";");
	}
}

function verifyEntries() {
	for(coord_index in coord_parsed) {
		switch(verifyFormat(coord_parsed[coord_index])) {
            case 1:
                var splitcoords = coord_parsed[coord_index].split(";");

                if(Number(splitcoords[0]) > Number(splitcoords[1]))
		            {          			
			            alert("One of your entries is invalid (" + coord_parsed[coord_index] +
			            "). Coordinates must be typed left to right (lowest position to highest position)." +
			            format_alert);

			            return false;
		            }
		            else if(Number(splitcoords[0]) === Number(splitcoords[1]))
		            {
			            alert("One of your entries is invalid (" + coord_parsed[coord_index] +
			            "). You cannot define a region of zero length." +
			            format_alert);

			            return false;
		            }
                    break;
            case 2:
                coord_parsed[coord_index] = coord_parsed[coord_index].slice(3,coord_parsed[coord_index].length);

                if(verifyFormat(coord_parsed[coord_index]) !== 3)
                {
                	break;
                }
            case 3:
                coord_parsed[coord_index] = parseUncertain(coord_parsed[coord_index],coordform.id.slice(0,3));

				break;
			default:
				return false;
		}
	}

	return true;

}

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
	var rgt_most = rgt.split("--")[1];

	if (lft !== lft_most) {       //If there is a left-hand breakpoint
		lft = lft.split("--")[1]; //Then take the right-hand part of the left coordinate
                                  //as the end of the lefthand uncertain breakpoint range
		if (lft_most > lft) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>Uncertain breakpoints must be typed left to right (lowest position to highest position).</p>" +
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
		if (rgt > rgt_most) {
			displayWarning("<p>One of your entries is invalid (" + targ_coord + ").</p>" +
			"<p>Uncertain breakpoints must be typed left to right (lowest position to highest position).</p>" +
			format_alert);
	
			return false;
		}
	}
	else {
		rgt_most = 0; //Indicates that there is no righthand uncertain breakpoint
	}

	if (lft > rgt) {          			
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
	var cur_array = preloaded.dataset[cur_arm][cur_type];

	//Removes whitespace between coordinate entries, which may result from copy-pasting data
	new_coords = new_coords.filter(function(element) { if(element !== "") { return true; }});

	for (cur_coord in new_coords) {
		var parsed_coord = parseVerifyCoord(new_coords[cur_coord],cur_arm);

		

		if (unique) cur_array.push(parsed_coord);
	}

	buildListbox(form_choice);
	coordform.value = "";
	
	return true;
}

function deleteCoordinate(delform_choice,arrays_type) {
	var delform = delform_choice;

	if(delform[delform.selectedIndex] === undefined) {
		return false;
	}

	var to_remove_name = delform[delform.selectedIndex].value;
	var to_remove_arm = to_remove_name.slice(0,2);
	var rem_array = arrays_type[all_arms.indexOf(to_remove_arm)];

	delete rem_array[rem_array.indexOf(to_remove_name.slice(3,to_remove_name.length))];

	fullSort(rem_array);
	rem_array.pop();

	buildListbox(all_arms.indexOf(to_remove_arm),delform);

	preloaded.elim_textbox.value = "";
	remaining_textbox.value = "";
	collapse_textbox.value = "";

	return true;
}