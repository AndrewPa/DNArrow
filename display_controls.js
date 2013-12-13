window.onload = function initQueryDOM() {
	window.preloaded = {
		//Initial DOM Query Items for Data/Results Display Boxes
		supbox: document.getElementById("sup_coordslist"),
		neubox: document.getElementById("neu_coordslist"),
		collapse_textbox: document.getElementById("collapse_textbox"),
		remaining_textbox: document.getElementById("remaining_textbox"),
		elim_textbox: 0, //spacekeeper: will be fixed when converted to objects
		armselect: document.getElementById('chrom_arm'),
		sup_input: document.getElementById("sup_input"),
		//Initial DOM Query Items for Dynamic CSS Alterations
		sup_input: document.getElementById("sup_input"),
		neu_input: document.getElementById("neu_input"),
		input_data: document.getElementsByClassName("input-data")
	};
	window.preloaded.all_boxes = [
		preloaded.supbox, preloaded.neubox, preloaded.elim_textbox, preloaded.collapse_textbox, preloaded.remaining_textbox
	]; //TO DO: convert to objects
	
	//Items for Dynamic CSS Alterations
	window.preloaded.sup_input_data = window.preloaded.input_data[0];
	window.preloaded.neu_input_data = window.preloaded.input_data[1];
	window.preloaded.rem_input_data = window.preloaded.input_data[2];
	window.preloaded.col_input_data = window.preloaded.input_data[3];

	window.preloaded.sup_input.onfocus = function() {
		window.preloaded.sup_input.classList.add("input-focus");
		window.preloaded.sup_input_data.classList.add("input-data-hover");
	};
	window.preloaded.sup_input.onblur = function() {
		window.preloaded.sup_input.classList.remove("input-focus");
		window.preloaded.sup_input_data.classList.remove("input-data-hover");
	};
	window.preloaded.neu_input.onfocus = function() {
		window.preloaded.neu_input.classList.add("input-focus");
		window.preloaded.neu_input_data.classList.add("input-data-hover");
	};
	window.preloaded.neu_input.onblur = function() {
		window.preloaded.neu_input.classList.remove("input-focus");
		window.preloaded.neu_input_data.classList.remove("input-data-hover");
	};

	return true;
};

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
	$( "#det_ins" ).append(
			"<p>" +
				"Enter the active/inactive region coordinates into their respective input forms." +
				"These can be typed in manually one at a time, or many at once, with each" +
				"region separated by a single space.	These can also be added by copying (sorted)" +
				"columns from an excel file and pasting the results into their respective input boxes." +
			"</p>" +
			"<p>The format should be as follows:</p>" +
			"<p>[A1];[A2] [B1];[B2]</p>" +
			"<p>e.g.: 100;200 200;300 300;400 etc.</p>" +
			"<p>" +
				"Please ensure that left and right bounds are separated by a semicolon (;)" +
				"and that only <em>spaces</em> separate each region. When ready to submit," +
				"press enter on your keyboard. You may delete any single coordinate from either" +
				"of the two input boxes by selecting them and pressing the delete key on your keyboard." +
			"</p>"
	);
	$( "#det_ins" ).dialog({
		modal: true,
		resizable: false,
		draggable: false,
		closeText: null,
		close: function() {
			$( "#det_ins" ).empty();
		}
	});

	/*
	 * Developer note:
	 * What follows is a work-around for jQuery-UI's limited dialog positioning 
	 * API: the dialog only calculates its centered position upon initialization
	 * and thus must be moved by the user upon a window resize. With this fix,
	 * the dialog maintains a fixed position in the exact center of the browser
	 * window at all times, even upon resizing and scrolling.
	 */

	$( "#det_ins" ).dialog('widget').attr("id", "fixed-dialog");
	$( "#fixed-dialog" ).css({
		"top":"50%",
		"margin-top":"-259px",
		"left":"50%",
		"margin-left":"-150px"
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