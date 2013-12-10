function clearListText(formchoice,array_type) {
	if(array_type == null) {
		formchoice.value = "";
	}
	else {
		formchoice.options.length = 0;
		array_type[preloaded.armselect.selectedIndex] = [];
	}
}

function showInstructions() { 
	$( "#det_ins" ).append(" \
			<p> \
				Enter the active/inactive region coordinates into their respective input forms. \
				These can be typed in manually one at a time, or many at once, with each \
				region separated by a single space.	These can also be added by copying (sorted) \
				columns from an excel file and pasting the results into their respective input boxes. \
			</p> \
			<p>The format should be as follows:</p> \
			<p>[CoordA1];[CoordA2] [CoordB1];[CoordB2]</p> \
			<p>e.g.: 100;200 200;300 300;400 etc.</p> \
			<p> \
				Please ensure that left and right bounds are separated by a semicolon (;) \
				and that only <em>spaces</em> separate each region. When ready to submit, \
				press enter on your keyboard. You may delete any single coordinate from either \
				of the two input boxes by selecting them and pressing the delete key on your keyboard. \
			</p> \
	");
	$( "#det_ins" ).dialog({
		width: 300,
		modal: true,
		resizable: false,
		closeText: null,
		close: function() {
			$( "#det_ins" ).empty();
		}
	});
}

function confirmClear(formchoice,array_type) {
	var message = "";

	if(formchoice === preloaded.supbox) {
		message = "active region coordinates?";
	}
	else if(formchoice === preloaded.neubox) {
		message = "inactive region coordinates?";
	}
	else if(formchoice === preloaded.remaining_textbox) {
		message = "results from Remaining?";
	}
	else if(formchoice === preloaded.collapse_textbox) {
		message = "results from Collapse?";
	}
	$( "#dialog-confirm" ).text("Clear all " + message);
	$( "#dialog-confirm" ).dialog({
		resizable: false,
		height: 140,
		modal: true,
		title: "Confirm Input Removal",
		closeText: null,
		buttons: {
			"Clear All": function() {
				$( this ).dialog( "close" );
				clearListText(formchoice,array_type);
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
}

function buildListbox() {
	if(arguments[0]) {
		target_listbox = [arguments[0]];
	}
	else {
		target_listbox = preloaded.all_boxes;
	}
	for(listbox in target_listbox) {
		var array_type = array_types[preloaded.all_boxes.indexOf(target_listbox[listbox])];
		var working_array = array_type[preloaded.armselect.selectedIndex];
		fullSort(working_array);

		if(target_listbox[listbox].type === "select-one") {
			target_listbox[listbox].options.length = 0;
			for(coord_index in working_array) {
				if(working_array[coord_index] === " ") {
					continue;
				}
				var newcoord = document.createElement('option');
				newcoord.value = all_arms[preloaded.armselect.selectedIndex] + ":" + working_array[coord_index];
				newcoord.text = all_arms[preloaded.armselect.selectedIndex] + ":" + working_array[coord_index];
				target_listbox[listbox].add(newcoord, null);
			}
		}
		else {
			var result_text = "";
			for(var i = 0; i < working_array.length; i++) {
				result_text += working_array[i] + "\n";
			}
			target_listbox[listbox].value = result_text;
		}
	}
	return true;
}