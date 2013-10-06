function narrowCoords()
{
    var input = elim_arrays[armselect.selectedIndex];
    initial = {nestlevel: "t"};
    initial["i"] = input.slice();

    solutions = findOverlappers();

    function findOverlappers()
    {
        var solutions = {};
    
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

                solution.push(input[coord2]);
                }
            }
        }

        return solutions;

    }

    function objectify(obj,sub_arr)
    {
        old_arr = obj[sub_arr];
        obj[sub_arr] = {};
        obj[sub_arr]["nestlevel"] = "" + arr + obj["nestlevel"];
        console.log(obj[sub_arr]["nestlevel"]);		

        for(index in old_arr)
        {
           obj[sub_arr][input.indexOf(old_arr[index])] = solutions[input.indexOf(old_arr[index])];
        }

        return obj[sub_arr];
    }

    function buildTree(obj)
    {
        for(arr in obj)
        {
            if(arr !== "nestlevel") 
            { 
                buildTree(objectify(obj,arr));
                
                for(index in obj[arr])
                {
                    for(parent in obj["nestlevel"])
                    {
                    	if(obj["nestlevel"][parent].match(/i|t/) !== null)
                    	{
                    		obj[arr][index] = undefined;
                    		obj[arr].sort(); obj[arr].pop();
                    	}
                    	else if(solutions[obj["nestlevel"][parent]].indexOf(obj[arr][index]) === -1)
                    	{
                    		continue
                    	}
                    }
                }
                /*if(obj[arr][0] === undefined)
                {
                    console.log(obj["nestedlevel"] + arr)
                    continue;
                }*/
            }
        }
    }
        buildTree(initial); console.log(initial);
}
//buildTree(objectify(obj,arr));