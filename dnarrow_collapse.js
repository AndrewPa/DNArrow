function collapseCoords()
{
	var coords = elim_arrays[armselect.selectedIndex];
	collapse_arrays[armselect.selectedIndex] = [];
	var solutions = collapse_arrays[armselect.selectedIndex];
	fullSort(coords);
	orig_list_num = coords.length;
	
	while(coords.length > 0) 
	{
		var coord1_full = coords[0];
		var coord1_left = Number(coord1_full.split(";")[0]);
		var coord1_right = Number(coord1_full.split(";")[1]);
		var last_coord = coords[coords.length-1];

		for(coord2 in coords) 
		{
			var found_overlap_toggle = 0;
			var coord2_full = coords[coord2];
	    	var coord2_left = Number(coord2_full.split(";")[0]);
			var coord2_right = Number(coord2_full.split(";")[1]);
			var all_coords = [coord1_left, coord1_right, coord2_left, coord2_right];
			var max = Math.max.apply(null, all_coords);
			var min = Math.min.apply(null, all_coords);

			if(Math.min(coord1_right,coord2_right) >= Math.max(coord1_left,coord2_left))
			{
				found_overlap_toggle = 1;

				if (coord1_full != coord2_full)
				{
					var collapsed_coord = min + ';' + max;

					coords.push(collapsed_coord);
					coords[coords.indexOf(coord1_full)] = undefined;
					coords[coords.indexOf(coord2_full)] = undefined;
					coords.sort(); coords.pop(); coords.pop();
					fullSort(coords);

					break;
				}
			}

			if (coord2_full == last_coord || (Number(found_overlap_toggle) == 0))
			{
					solutions.push(coord1_full);
					coords[coords.indexOf(coord1_full)] = undefined;
					coords.sort(); coords.pop();
					fullSort(coords);
					break;
			}
		}
	}
	
	buildListbox(collapse_textbox);

	return true;

}