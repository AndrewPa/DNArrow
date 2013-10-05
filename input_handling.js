window.onload = function getElements()
{
	window.supbox = document.getElementById("sup_coordslist");
	window.neubox = document.getElementById("neu_coordslist");
	window.elim_textbox = document.getElementById("eliminate_results");
	window.narrow_textbox = document.getElementById("narrow_results");
	window.all_boxes = [supbox, neubox, elim_textbox, narrow_textbox, collapse_textbox];
	window.armselect = document.getElementById('chrom_arm');

    return true;
}

//The order of solution arrays and their corresponding display elements is critical for correct display;
//this is because the same index is called in order to bind the correct display to the correct array

var coordarray = [];
var sup2L = [], sup2R = [], sup3L = [], sup3R = [];
var neu2L = [], neu2R = [], neu3L = [], neu3R = [];
var elim2L = [], elim2R = [], elim3L = [], elim3R = [];
var narrow2L = [], narrow2R = [], narrow3L = [], narrow3R = [];
var col2L = [], col2R = [], col3L = [], col3R = [];
var all_arms = ["2L", "2R", "3L", "3R"];
var sup_arrays = [sup2L, sup2R, sup3L, sup3R];
var neu_arrays = [neu2L, neu2R, neu3L, neu3R];
var elim_arrays = [elim2L, elim2R, elim3L, elim3R];
var narrow_arrays = [narrow2L, narrow2R, narrow3L, narrow3R];
var collapse_arrays = [col2L, col2R, col3L, col3R];
var array_types = [sup_arrays, neu_arrays, elim_arrays, narrow_arrays, collapse_arrays];
var armselect = document.getElementById('chrom_arm');
var format_alert = "\n\n" + "Format: [CoordinateA1];[CoordinateA2] [CoordinateB1];[CoordinateB2] " + 
"\n\n" + "e.g.: 100;200 200;300 300;400 etc."

//The order of chromosome arms and associated arrays is critical for proper entry;
//for the purpose of this script I use the convention: 2L, 2R, 3L, 3R from L->R

function fullSort(a)
{	
    a.sort(function(a, b)
	{
		if(a.split(";")[0] - b.split(";")[0] !== 0) 
	    { 
	    	return a.split(";")[0] - b.split(";")[0]; 
        }
        else
        {
        	return a.split(";")[1] - b.split(";")[1]; 
        }
    });
    
    return a;
    
}

function removeDuplicates(target_array)
{
    target_array.sort();
    var i = 1;
	
    while(i < target_array.length)
    {	
	    if(target_array[i] == target_array[i+1])
	    {	
		    target_array[i] = undefined;
            target_array.sort();
            target_array.pop();

            i = 0;
	    }
	    else
	    {
		    i += 1;
	    }
    }
    
    return true;
    
}

function removeSpaces(s)
{
    for(var i = 0; i < s.length; i++)
    {
        if(s[i] !== " ")
        {
    	    s = s.slice(i,s.length);
    	    break;
        }
    }
    for(var i = s.length-1; i >= 0; i--)
    {
	    if(s[i] !== " ")
	    {
        return s.slice(0,i+1);
	    }
    }
}

function verifyFormat(targ)
{
    if(targ.match(/(^[1-9]\d+|^[0-9]);([1-9]\d+$|[1-9]$)/))
    {
    	return 1; //case 1: entry is in the correct format and is processed normally
    }
    else if(targ.match((/^[2-3](L|R):/)))
    {
    	if(targ.slice(0,2) === armselect.value)
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

function buildListbox()
{
    if(arguments[0])
	{
	    target_listbox = [arguments[0]];
	}
	else
	{
		target_listbox = all_boxes;
	}

	for(listbox in target_listbox)
	{
	    var array_type = array_types[all_boxes.indexOf(target_listbox[listbox])];
	    var working_array = array_type[armselect.selectedIndex];
	    fullSort(working_array);

        if(target_listbox[listbox].type === "select-one")
        {
            target_listbox[listbox].options.length = 0;

	        for(coord_index in working_array)
            {
            
                if(working_array[coord_index] === " ")
                {
            	    continue;
                }

                var newcoord = document.createElement('option');
                newcoord.value = all_arms[armselect.selectedIndex] + ":" + working_array[coord_index];
                newcoord.text = all_arms[armselect.selectedIndex] + ":" + working_array[coord_index];

                target_listbox[listbox].add(newcoord, null);
            }
        }
        else
        {
            var result_text = "";

            for(var i = 0; i < working_array.length; i++)
            {
                result_text += working_array[i] + "\n";
            }
    
            target_listbox[listbox].value = result_text;
        }
    }

    return true;

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

function submitCoordinate(input_choice,form_choice,arrays_type)
{
    var coordform = document.getElementById(input_choice);

    if(coordform.value == false)
    {
        alert("Please enter a value.");

        coordform.value = "";

        return false;
    }

    var working_array = arrays_type[armselect.selectedIndex]; //array associated with the selected arm
    
    window.coord_parsed = removeSpaces(coordform.value).split(" ");
    coord_parsed = coord_parsed.filter(function(element) { if(element !== "") { return true; }});
    fullSort(coord_parsed);

    function verifyEntries()
	{
   		for(coord_index in coord_parsed)
   		{	
            switch(verifyFormat(coord_parsed[coord_index]))
            {
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

function deleteCoordinate(delform_choice,arrays_type)
{
	var delform = delform_choice;
	
	if(delform[delform.selectedIndex] === undefined)
	{
	    return false;
	}
	
	var to_remove_name = delform[delform.selectedIndex].value;
	var to_remove_arm = to_remove_name.slice(0,2);
	var rem_array = arrays_type[all_arms.indexOf(to_remove_arm)];
	
	delete rem_array[rem_array.indexOf(to_remove_name.slice(3,to_remove_name.length))];
	
    fullSort(rem_array);
    rem_array.pop();
	
	buildListbox(all_arms.indexOf(to_remove_arm),delform);

    elim_textbox.value = "";
    narrow_textbox.value = "";

	return true;
}

function clearListbox(formchoice,array_type)
{
	var boxname = "";

	if(formchoice === supbox)
	{
		boxname = "active region";
	}
	else if(formchoice === neubox)
	{
		boxname = "inactive region";
	}
	if(confirm("Clear all " + boxname + " coordinates?"))
	{
	    formchoice.options.length = 0;
	
        array_type[armselect.selectedIndex] = [];
	}
}