//TO DO: create a constructor that contains these starting properties
//TO DO: remove hard-coded genome lengths; give user option to change them manually; later provide scraper for flybase.net

function computeRemaining() {
	var chrom_arm = armselect.selectedIndex;
	var coords = sup_arrays[chrom_arm].concat(neu_arrays[chrom_arm]); //merge all inputed coordinates into one array
	var chrom_sizes = [23011546, 21146710, 24543559, 27905055]; //from character count of raw Dmel genome files from flybase.net
	var num_bases = chrom_sizes[chrom_arm];
	var covered_regions = collapseCoords(coords); //merge all inputed coordinates into easily managed, non-overlapping regions
	
	if(!covered_regions) {
		return false; //coords passed but no data was entered by user; do nothing, possibly generate alert
	} else {
		remaining_arrays[chrom_arm] = eliminateOverlaps(num_bases, covered_regions); //then take those regions as 'neus' and the whole chromosome as a 'sup'	
		buildListbox(remaining_textbox);
		return true;
	}
}