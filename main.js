//The order of solution arrays and their corresponding display elements is critical for correct display;
//this is because the same index is called in order to bind the correct display to the correct array
var coordarray = [];
var all_arms = ["2L", "2R", "3L", "3R"];
var sup_arrays = [[], [], [], []];
var neu_arrays = [[], [], [], []];
var elim_arrays = [[], [], [], []];
var narrow_arrays = [[], [], [], []];
var collapse_arrays = [[], [], [], []];
var remaining_arrays = [[], [], [], []];
var array_types = [sup_arrays, neu_arrays, elim_arrays, collapse_arrays, remaining_arrays];
var format_alert = "\n\n" + "Format: [CoordinateA1];[CoordinateA2] [CoordinateB1];[CoordinateB2] " + 
				   "\n\n" + "e.g.: 100;200 200;300 300;400 etc.";
//The order of chromosome arms and associated arrays is critical for proper entry;
//for the purpose of this script I use the convention: 2L, 2R, 3L, 3R from L->R

var splash = document.getElementById("loading_data");
	splash.parentNode.removeChild(splash);
	//Removes "loading" text after data is loaded and passed to JS

function DataFactory(arm_label) {
	this.sup = [];
	this.neu = [];
	this.elim = [];
	this.collapse = [];
	this.remaining = [];
	//this.hotspots = []; (not yet implemented)
}

var data = {
	arm2L: new DataFactory(),
	arm2R: new DataFactory(),
	arm3L: new DataFactory(),
	arm3R: new DataFactory()
};