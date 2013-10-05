function eliminateOverlaps() //Removes inactive regions from active ones; output becomes input of Narrow and Collapse.
{
	var target_sups = sup_arrays[armselect.selectedIndex].slice(0);
	var target_neus = neu_arrays[armselect.selectedIndex].slice(0);
	var does_overlap_right = 0; //Optimization; skips proceeding regions known not to overlap on 'right-hand' side
	var supcount = 0;
	elim_arrays[armselect.selectedIndex] = [];
	var solutions = elim_arrays[armselect.selectedIndex];

    fullSort(target_sups); //Sorting needed for optimization
    fullSort(target_neus);

	while(supcount < target_sups.length) //"while" loop because array length needs to be re-evaluated every pass
	{
	    	var supcoord_full = target_sups[supcount];
	    	var supcoord_left = Number(supcoord_full.split(";")[0]);
	    	var supcoord_right = Number(supcoord_full.split(";")[1]);
	    	var did_overlap_right = 0;
	    	var narrowsup_left = supcoord_left;
            var narrowsup_right = supcoord_right;
            var neucount = 0; //Here and 'neucount - 1' below are 'left-hand' optimizations
	    	
	    	for(neucount - 1; neucount < target_neus.length; neucount++)
	    	{
	    	    var neucoord_full = target_neus[neucount];
	    	    var neucoord_left = Number(neucoord_full.split(";")[0]);
	    	    var neucoord_right = Number(neucoord_full.split(";")[1]);
	    	    
	    	    var test1 = false;
	    	    var test2 = false;
	    	    var narrow_left_left = 0;
	    	    
                supcoord_left = narrowsup_left;
                supcoord_right = narrowsup_right;

	    	    if(neucoord_left <= supcoord_left && neucoord_right >= supcoord_right) //Case 1: whole region cancelled out
	    	    {
	    	    	console.log("Contradiction found in " + supcoord_full + " and " + neucoord_full);
                    var narrowsup_left = "DNE"; //Region explicitly shown to have been removed; may be fetched in later code
                    var narrowsup_right = "DNE";

                    supcoord_full = narrowsup_left + ";" + narrowsup_right;

                    break;
	    	    }
                else if(neucoord_left <= supcoord_left && neucoord_right >= supcoord_left) //Case 2: left side sliced off
                {
                    narrowsup_left = neucoord_right;
                }
                else
                {
                    test1 = true; //test1 and test2 are optimizations; checks case 4 only if case 1, 2 and 3 fail
                }
                if(neucoord_right >= supcoord_right && supcoord_right >= neucoord_left) //Case 3: right side sliced off
                {
                    narrowsup_right = neucoord_left;

                    does_overlap_right = 1; //Note this optimization is only for 'right-hand' regions
                    did_overlap_right = 1;
                }
                else
                {
                	test2 = true;
                }
                if(test1 && test2)
                {
                    if(supcoord_left <= neucoord_left && supcoord_right >= neucoord_right) //Case 4: region is bisected
                    {
                        narrow_left_left = supcoord_left;  //Adds two new, subtracted coordinates back into target array
                        narrow_left_right = neucoord_left; //These new regions are cycled back into the algorithm
                        narrow_right_left = neucoord_right;
                        narrow_right_right = supcoord_right;
                    }
                }
                
                supcoord_full = narrowsup_left + ";" + narrowsup_right;
                
                if(narrow_left_left !== 0)
                {
                	target_sups.push(narrow_left_left + ";" + narrow_left_right);
                	target_sups.push(narrow_right_left + ";" + narrow_right_right);
                	target_sups[supcount] = undefined;
                    fullSort(target_sups);
                    target_sups.pop();

                    supcoord_full = "";
                    supcount -= 1;

                    break;
                }
                if(did_overlap_right === 1)
                {
                    if(does_overlap_right === 0)
                    {
                        break;
                    }
                }
	    	}

            if(supcoord_full !== "" && solutions.indexOf(supcoord_full) === -1)
            {
                solutions.push(supcoord_full);
            }

            supcount++;

	    }

    return true;

}