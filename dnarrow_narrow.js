function narrowCoords()
{
    var input = elim_arrays[armselect.selectedIndex]
    var narcoords = [];
    narrow_arrays[armselect.selectedIndex] = [];
    var solutions = narrow_arrays[armselect.selectedIndex];
    window.name_array = [];

    for(coord1 in input)
    {
        var coordslist = [];
        var coord1_full = input[coord1];
        var coord1_left = Number(coord1_full.split(";")[0]);
        var coord1_right = Number(coord1_full.split(";")[1]);
        var did_overlap = false;
        var does_overlap = false;
        var name = "" + coord1;

        for(coord2 in input)
        {
            if(!does_overlap && did_overlap)
            {
                break;
            }

            var coord2_full = input[coord2];
            var coord2_left = Number(coord2_full.split(";")[0]);
            var coord2_right = Number(coord2_full.split(";")[1]);

            if(Math.min(coord1_right,coord2_right) > Math.max(coord1_left,coord2_left)) //Overlap test
            {
                var did_overlap = true;
                var does_overlap = true;

                if(coord1_full !== coord2_full)
                {
                    name += coord2;

                    var all_coords = [coord1_left,coord1_right,coord2_left,coord2_right];
                    var max = Math.max.apply(null, all_coords);
                    var min = Math.min.apply(null, all_coords);

                    delete all_coords[all_coords.indexOf(max)];
                    delete all_coords[all_coords.indexOf(min)];
                    all_coords.sort(); all_coords.pop(); all_coords.pop();
                    
                    coord1_left = Math.min.apply(null, all_coords);
                    coord1_right = Math.max.apply(null, all_coords);
                    coord1_full = coord1_left + ";" + coord1_right;
                    
                    if(solutions.indexOf(coord1_full) === -1)
                    {
                        name_array.push(name);
                        solutions.push(coord1_full);
                    }
                }
            }
            else
            {
            	does_overlap = false;
            }
        }
    }

    buildListbox(narrow_textbox);

    return true;

}