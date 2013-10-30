window.onload = function initQueryDOM() {
	window.preloaded = {
		supbox: document.getElementById("sup_coordslist"),
		neubox: document.getElementById("neu_coordslist"),
		collapse_textbox: document.getElementById("collapse_textbox"),
		remaining_textbox: document.getElementById("remaining_textbox"),
		elim_textbox: 0, //spacekeeper: will be fixed when converted to objects
		armselect: document.getElementById('chrom_arm')
	};
	window.preloaded.all_boxes = [
		preloaded.supbox, preloaded.neubox, preloaded.elim_textbox, preloaded.collapse_textbox, preloaded.remaining_textbox
	]; //TO DO: convert to objects
    return true;
};

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