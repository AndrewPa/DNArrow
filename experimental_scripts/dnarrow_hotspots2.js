//<script>
function intersection(a1, a2)
{
	return a1.filter((function(element) { return a2.indexOf(element) !== -1 }));
}

function hotSpots()
{
	var coords = elim_arrays[armselect.selectedIndex];
	var input = coords;
	var passed = [];
	var nesters = [];
	var current_index = [];
	var initial = [];
	var permutes = [];
	
	for(var i = 0; i < coords.length; i++)
	{
	    initial.push(i);
	}
	
	function findOverlappers(input)
	{
	    window.solutions = {};
	
	    for(var coord1 = 0; coord1 < input.length; coord1++)
	    {
	        var coordslist = [];
	        var coord1_full = input[coord1];
	        var coord1_left = Number(coord1_full.split(";")[0]);
	        var coord1_right = Number(coord1_full.split(";")[1]);
	        var did_overlap = false;
	        var does_overlap = false;
	        var name = coord1 + "";
	        solutions[name] = [];
	        solution = solutions[name];
	
	        for(var coord2 = Number(coord1) + 1; coord2 < input.length; coord2++)
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
	
	                solution.push(coord2);
	            }
	        }
	    }

	    return true;

	}
	
	function nextLevel(coords)
	{
		if(coords[0] === undefined)
		{
	        console.log(nesters);
			passed.push(nesters[nesters.length - 1]);
			nesters.pop();

			return true;
		}
		else
		{
			for(coord in coords)
		    {
	            if(passed.indexOf(coords[coord]) !== -1)
	            {
	            	continue;
	            }
	            if(nesters[0] === undefined)
	            {
	                var name = coords[coord];
	                nesters.push(coords[coord]);
	                nextLevel(solutions[name]);
	            }
	            else
	            {
	            	console.log(nesters);
	            	for(var nester = 0; nester < nesters.length; nester++)
	            	{
	            		 if(solutions[nesters[nester]].indexOf(coords[coord]) !== -1)
	            		 {
	            		     nesters = nesters.slice(nester,nesters.length);
	            		     var name = coords[coord];
	                         nesters.push(coords[coord]);
	                         nextLevel(solutions[name]);
	                         break;
	            		 }
	            		 else
	            		 {
	            		 	nesters[nester] = undefined; nesters.sort(); nesters.pop();
	            		 	nester--;
	            		 }
	            	}
	            }
	        }
		}
	}

	findOverlappers(coords); nextLevel(initial); console.log(permutes);

}

/*
if(nesters.length > 1)
{
    permutes.push(nesters.slice());
}
*/