function collapseCoords(coords) {
	if(!coords) {
		var chrom_arm = armselect.selectedIndex;
		var coords = elim_arrays[chrom_arm];
		collapse_arrays[chrom_arm] = [];
		var solutions = collapse_arrays[chrom_arm];

	} else if(!coords[0]) {
		return false; //coords passed but no data was entered by user; do nothing, possibly generate alert
	} else {
		var return_output = true;
		var solutions = []; 
	} //allows function to be used generically; needed by dnarrow_remaining.js

	fullSort(coords);
	orig_list_num = coords.length;
	
	while(coords.length > 0) { //array length needs to be re-evaluated every pass
		var coord1_full = coords[0];
		var coord1_left = Number(coord1_full.split(";")[0]);
		var coord1_right = Number(coord1_full.split(";")[1]);
		var last_coord = coords[coords.length-1];
		var coords_length = coords.length; //value stored in outer loop to avoid extra array length evaluations

		for(var coord2 = 0; coord2 < coords_length; coord2++) {
			var found_overlap_toggle = 0;
			var coord2_full = coords[coord2];
			var coord2_left = Number(coord2_full.split(";")[0]);
			var coord2_right = Number(coord2_full.split(";")[1]);
			var all_coords = [coord1_left, coord1_right, coord2_left, coord2_right];
			var max = Math.max.apply(null, all_coords);
			var min = Math.min.apply(null, all_coords);

			if(Math.min(coord1_right,coord2_right) >= Math.max(coord1_left,coord2_left)) {
				found_overlap_toggle = 1;

				if (coord1_full != coord2_full) {
					var collapsed_coord = min + ';' + max;

					coords.push(collapsed_coord);
					coords[coords.indexOf(coord1_full)] = undefined;
					coords[coords.indexOf(coord2_full)] = undefined;
					coords.sort(); coords.pop(); coords.pop();
					fullSort(coords);

					break;
				}
			}

			if (coord2_full == last_coord || (Number(found_overlap_toggle) == 0)) {
					solutions.push(coord1_full);
					coords[coords.indexOf(coord1_full)] = undefined;
					coords.sort(); coords.pop();
					fullSort(coords);
					break;
			}
		}
	}

	if(return_output === true) {
		return solutions;
	}

	buildListbox(collapse_textbox);
	return true;

}