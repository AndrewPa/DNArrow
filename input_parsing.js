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

function submitCoordinate(input_choice,form_choice,arrays_type) {
	var coordform = document.getElementById(input_choice);

	if(coordform.value == false) {
		alert("Please enter a value.");
		coordform.value = "";

		return false;
	}

	var working_array = preloaded.dataset.; //array associated with the selected arm

	window.coord_parsed = coordform.value.trim().split(" ");
	coord_parsed = coord_parsed.filter(function(element) { if(element !== "") { return true; }});
	fullSort(coord_parsed);

	if(verifyEntries() === true)
	{
    	for(coord_index in coord_parsed)
    	{
    		if(working_array.indexOf(coord_parsed[coord_index]) !== -1)
    		{
    			continue;
    		}
    		else
    		{
				Array.prototype.push.call(working_array,coord_parsed[coord_index]);
    		}
    	}

		fullSort(working_array);

		buildListbox(form_choice);

        coordform.value = "";

	}
    
    return true;
    
    //Each new listbox entry is built from the coord_parsed array; screening values
    //from this array (above) thus has a downstream filtering effect on the listbox values
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