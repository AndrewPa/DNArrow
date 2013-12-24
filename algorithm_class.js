//A constructor for all functions that handle coordinate data
function AlgorithmFactory(solutions_array, coordinates, algorithm) {
	this.clearSolutions = function() { 
		solutions_array[this.chrom_arm] = []; 
	}; //method to clear the solutions found on a previous function call 
	this.solutions = solutions_array; //array type that stores results from previous method call, used as shorthand in algorithm
	this.coordinates = coordinates; //array that stores one or more input coordinate arrays
	this.algorithm = AllAlgorithms[algorithm]; //placeholder for data analysis method
}

//TO DO: update function names, add into single-instance class and update references as necessary
var neweliminate = new AlgorithmFactory(elim_arrays, [sup_arrays, neu_arrays], "eliminateOverlaps");
var newcollapse = new AlgorithmFactory(collapse_arrays, [elim_arrays], "collapseCoords");
var newremaining = new AlgorithmFactory(remaining_arrays, [sup_arrays, neu_arrays], "computeRemaining");