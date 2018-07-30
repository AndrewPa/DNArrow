'use strict';

// Modified sort function that sorts numerically (ascending) by the first
// endpoint, then the second endpoint, of each coordinate pair
function fullSort(a) {
    a.sort(function (a, b) {
        if (a.split(';')[0] - b.split(';')[0] !== 0) {
            return a.split(';')[0] - b.split(';')[0];
        } else {
            return a.split(';')[1] - b.split(';')[1];
        }
    });

    return a;
}

// Removes inactive regions from active ones; output becomes input of collapseCoords.
function eliminateOverlaps(chrom_length, tested_regions) {
    var solutions;
    var target_acts;
    var target_inas;

    if (!chrom_length && !tested_regions) {
        var cur_arm = button_states.arm_panel.prev_label.substr(8, 9);
        var cur_type = button_states.e_s_panel.prev_label.substr(0, 3);
        preloaded.dataset[cur_arm][cur_type].elm = [];
        solutions = preloaded.dataset[cur_arm][cur_type].elm;
        target_acts = preloaded.dataset[cur_arm][cur_type].pre_col.slice(0);
        target_inas = preloaded.dataset[cur_arm].ina.pre_col.slice(0);
    } else {
        var return_output = true;
        solutions = [];
        target_acts = ['1;' + chrom_length];
        target_inas = tested_regions;
    } // allows function to be used generically; needed by computeRemaining

    var does_overlap_right = 0; // Optimization; skips proceeding regions known not to overlap on 'right-hand' side
    var supcount = 0;

    fullSort(target_acts); // sorting needed for optimization
    fullSort(target_inas);

    while (supcount < target_acts.length) { // array length needs to be re-evaluated every pass
        var supcoord_full = target_acts[supcount];
        var supcoord_left = Number(supcoord_full.split(';')[0]);
        var supcoord_right = Number(supcoord_full.split(';')[1]);
        var did_overlap_right = 0;
        var narrowsup_left = supcoord_left;
        var narrowsup_right = supcoord_right;
        var neucount = 0; // here and 'neucount - 1' below are 'left-hand' optimizations

        for (neucount - 1; neucount < target_inas.length; neucount++) {
            var neucoord_full = target_inas[neucount];
            var neucoord_left = Number(neucoord_full.split(';')[0]);
            var neucoord_right = Number(neucoord_full.split(';')[1]);
            var test1 = false;
            var test2 = false;

            var narrow_left_left = 0;
            var narrow_left_right;
            var narrow_right_left;
            var narrow_right_right;

            supcoord_left = narrowsup_left;
            supcoord_right = narrowsup_right;

            // Case 1: whole region cancelled out
            if (neucoord_left <= supcoord_left && neucoord_right >= supcoord_right) {
                console.log('Contradiction found in ' + supcoord_full + ' and ' + neucoord_full);
                narrowsup_left = 'DNE'; // Region explicitly shown to have been removed; may be fetched in later code
                narrowsup_right = 'DNE';

                supcoord_full = narrowsup_left + ';' + narrowsup_right;

                break;
                // Case 2: left side sliced off
            } else if (neucoord_left <= supcoord_left && neucoord_right >= supcoord_left) {
                narrowsup_left = neucoord_right;
            } else {
                test1 = true; // test1 and test2 are optimizations; checks case 4 only if case 1, 2 and 3 fail
            }

            // Case 3: right side sliced off
            if (neucoord_right >= supcoord_right && supcoord_right >= neucoord_left) {
                narrowsup_right = neucoord_left;
                does_overlap_right = 1; // note this optimization is only for 'right-hand' regions
                did_overlap_right = 1;
            } else {
                test2 = true;
            }
            if (test1 && test2) {
                // Case 4: region is bisected
                if (supcoord_left <= neucoord_left && supcoord_right >= neucoord_right) {
                    narrow_left_left = supcoord_left;  // Adds two new, subtracted coordinates back into target array
                    narrow_left_right = neucoord_left; // These new regions are cycled back into the algorithm
                    narrow_right_left = neucoord_right;
                    narrow_right_right = supcoord_right;
                }
            }

            supcoord_full = narrowsup_left + ';' + narrowsup_right;

            if (narrow_left_left !== 0) {
                target_acts.push(narrow_left_left + ';' + narrow_left_right);
                target_acts.push(narrow_right_left + ';' + narrow_right_right);
                target_acts[supcount] = undefined;
                fullSort(target_acts);
                target_acts.pop();

                supcoord_full = '';
                supcount -= 1;

                break;
            }

            if (did_overlap_right === 1) {
                if (does_overlap_right === 0) {
                    break;
                }
            }
        }
        if (supcoord_full !== '' && solutions.indexOf(supcoord_full) === -1 && supcoord_full !== 'DNE;DNE') {
            solutions.push(supcoord_full);
        }

        supcount += 1;

    }

    if (return_output === true) {
        return solutions;
    }

    return true;
}

function collapseCoords(coords) {
    var solutions;

    if (!coords) {
        this.eliminateOverlaps();
        var cur_arm = button_states.arm_panel.prev_label.substr(8, 9);
        var cur_type = button_states.e_s_panel.prev_label.substr(0, 3);
        preloaded.dataset[cur_arm][cur_type].col = [];
        solutions = preloaded.dataset[cur_arm][cur_type].col;
        coords = preloaded.dataset[cur_arm][cur_type].elm;
    } else if (!coords[0]) {
        return false; // coords passed but no data was entered by user; do nothing, possibly generate alert
    } else {
        var return_output = true;
        solutions = [];
    } // allows function to be used generically; needed by computeRemaining

    fullSort(coords);

    while (coords.length > 0) { // array length needs to be re-evaluated every pass
        var coord1_full = coords[0];
        var coord1_left = Number(coord1_full.split(';')[0]);
        var coord1_right = Number(coord1_full.split(';')[1]);
        var last_coord = coords[coords.length - 1];
        var coords_length = coords.length; // value stored in outer loop to avoid extra array length evaluations

        for (var coord2 = 0; coord2 < coords_length; coord2++) {
            var found_overlap_toggle = 0;
            var coord2_full = coords[coord2];
            var coord2_left = Number(coord2_full.split(';')[0]);
            var coord2_right = Number(coord2_full.split(';')[1]);
            var all_coords = [coord1_left, coord1_right, coord2_left, coord2_right];
            var max = Math.max.apply(null, all_coords);
            var min = Math.min.apply(null, all_coords);

            if (Math.min(coord1_right, coord2_right) >= Math.max(coord1_left, coord2_left)) {
                found_overlap_toggle = 1;

                if (coord1_full !== coord2_full) {
                    var collapsed_coord = min + ';' + max;

                    coords.push(collapsed_coord);
                    coords[coords.indexOf(coord1_full)] = undefined;
                    coords[coords.indexOf(coord2_full)] = undefined;
                    coords.sort();
                    coords.pop();
                    coords.pop();
                    fullSort(coords);

                    break;
                }
            }

            if (coord2_full === last_coord || (Number(found_overlap_toggle) === 0)) {
                solutions.push(coord1_full);
                coords[coords.indexOf(coord1_full)] = undefined;
                coords.sort();
                coords.pop();
                fullSort(coords);
                break;
            }
        }
    }

    if (return_output === true) {
        return solutions;
    }

    buildListbox(3); // Index of Collapse display box
    return true;
}

function computeRemaining() {
    var cur_arm = button_states.arm_panel.prev_label.substr(8, 9);
    preloaded.dataset[cur_arm].rem = [];
    var coords = [];

    for (var input_type in preloaded.input_types) {
        // merge all inputted coordinates into one array
        coords = coords.concat(preloaded.dataset[cur_arm][preloaded.input_types[input_type]].pre_rem);
    }

    var num_bases = preloaded.chrom_sizes[cur_arm];
    // merge all inputted coordinates into easily managed, non-overlapping regions
    var covered_regions = this.collapseCoords(coords) || [];

    // then finally, take those regions as 'inas' and the whole chromosome as a 'act'
    preloaded.dataset[cur_arm].rem = this.eliminateOverlaps(num_bases, covered_regions);
    buildListbox(2); // Index of Remaining display box
    return true;
}

window.AllAlgorithms = {
    eliminateOverlaps: eliminateOverlaps,
    collapseCoords: collapseCoords,
    computeRemaining: computeRemaining
};
