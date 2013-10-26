function buildListbox()
{
    if(arguments[0])
	{
	    target_listbox = [arguments[0]];
	}
	else
	{
		target_listbox = preloaded.all_boxes;
	}

	for(listbox in target_listbox)
	{
	    var array_type = array_types[preloaded.all_boxes.indexOf(target_listbox[listbox])];
	    var working_array = array_type[preloaded.armselect.selectedIndex];
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
                newcoord.value = all_arms[preloaded.armselect.selectedIndex] + ":" + working_array[coord_index];
                newcoord.text = all_arms[preloaded.armselect.selectedIndex] + ":" + working_array[coord_index];

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

function clearListbox(formchoice,array_type)
{
	var boxname = "";

	if(formchoice === preloaded.supbox)
	{
		boxname = "active region";
	}
	else if(formchoice === preloaded.neubox)
	{
		boxname = "inactive region";
	}
	if(confirm("Clear all " + boxname + " coordinates?"))
	{
	    formchoice.options.length = 0;
	
        array_type[preloaded.armselect.selectedIndex] = [];
	}
}