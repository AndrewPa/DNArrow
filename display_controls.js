function radioSelector(panel_name,button_label) {
	/*
	 * Controls display of light colored border around Arm Selection Boxes
	 * Deletes and re-applies 'onclick' attribute to selected boxes to prevent 
	 * additional function calls when the same box is clicked repeatedly
	 */
	//Shorthand local variable
	var states = button_states[panel_name];

	cur_label = button_label;
	states.sel_button.classList.remove("choose-box-active");
	states.sel_button.setAttribute("onclick","radioSelector(\'" + panel_name + "\',\'" + states.prev_label + "\')");
	states.sel_button = window.preloaded[button_label];
	states.prev_label = cur_label;
	preloaded[button_label].removeAttribute("onclick");
	preloaded[button_label].classList.add("choose-box-active");

	if (button_label === "enh_toggle") {
		preloaded.active_title.childNodes[0].nodeValue = "Enhancers";
	}
	else if (button_label === "sup_toggle") {
		preloaded.active_title.childNodes[0].nodeValue = "Suppressors";
	}
}

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
				"Enter the active/inactive region coordinates into their respective input forms. " +
				"These can be typed in manually one at a time, or many at once, with each " +
				"region separated by a single space. These can also be added by copying (sorted) " +
				"columns from an excel file and pasting the results into their respective input boxes." +
			"</p>" +
			"<p>The format should be as follows:</p>" +
			"<p>[A1];[A2] [B1];[B2]</p>" +
			"<p>e.g.: 100;200 200;300 300;400 etc.</p>" +
			"<p>" +
				"Please ensure that left and right bounds are separated by a semicolon (;) " +
				"and that only <em>spaces</em> separate each region. When ready to submit, " +
				"press enter on your keyboard. You may delete any single coordinate from either " +
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
		},
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

function displayWarning(message) {
	$( "#warning_text" ).append("<p>" + message + "</p>");
	$( "#warning_text" ).dialog({
	modal: true,
	resizable: false,
	draggable: false,
	closeText: null,
	width: 300,
	close: function() {
		$( "#warning_text" ).empty();
		},
	});
	$( "#warning_text" ).dialog('widget').attr("id", "fixed-dialog");
	$( "#fixed-dialog" ).css({
		"top":"50%",
		"margin-top":"-108px", //Auto height for current font and width is 216px
		"left":"50%",
		"margin-left":"-150px"
	});
}

function confirmClear(formchoice,array_type) {
	var message = "";

	if(formchoice === preloaded.supbox) { //TO DO: Convert ELIF tree to associative array
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
	$(".ui-dialog-titlebar-close").removeAttr("title");
}

function buildListbox(cur_arm,cur_type,target_listbox) {
	if(arguments[2] !== undefined) {
		//Framework: Allows any number of listboxes to be re-updated when passed as arguments
		target_listbox = Array.prototype.slice.call(arguments,2,arguments.length);
	}
	else {
		target_listbox = preloaded.all_boxes;
	}
	for(listbox in target_listbox) {
		var working_array = preloaded.dataset[cur_arm][cur_type]["passed"];
		fullSort(working_array);

		if(target_listbox[listbox].type === "select-one") {
			target_listbox[listbox].options.length = 0;
			for(coord_index in working_array) {
				if(working_array[coord_index] === " ") {
					continue;
				}
				var newcoord = document.createElement('option');
				newcoord.value = cur_arm + ":" + working_array[coord_index];
				newcoord.text = cur_arm + ":" + working_array[coord_index];
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