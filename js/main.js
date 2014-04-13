//Performs all critical starting operations, e.g. DOM queries and data scaffold construction
window.onload = function initQueryDOM() {
    window.preloaded = {
        //Initial DOM Query Items for Data/Results Display Boxes
        displays: document.getElementsByClassName("displaybox"),
        armselect: document.getElementById('chrom_arm'),
        //Initial DOM Query Items for Dynamic CSS Alterations
        act_input: document.getElementById("act_input"),
        ina_input: document.getElementById("ina_input"),
        input_data: document.getElementsByClassName("input-data"),
        arm_boxes: document.getElementsByClassName("arm-box"),
        sup_enh_toggles: document.getElementsByClassName("sup-enh-toggle"),
        active_title: document.getElementById("active_title"),
        //sizes are from character count of raw Dmel genome files from flybase.net
        chrom_sizes: {
            "2L": 23011546, 
            "2R": 21146710,
            "3L": 24543559,
            "3R": 27905055
        }
    };

    window.preloaded.actbox = window.preloaded.displays[0];
    window.preloaded.inabox = window.preloaded.displays[1];
    window.preloaded.remaining_textbox = window.preloaded.displays[2];
    window.preloaded.collapse_textbox = window.preloaded.displays[3];

    //Items for Dynamic CSS Alterations
    window.preloaded.act_input_data = window.preloaded.input_data[0];
    window.preloaded.ina_input_data = window.preloaded.input_data[1];
    window.preloaded.rem_input_data = window.preloaded.input_data[2];
    window.preloaded.col_input_data = window.preloaded.input_data[3];

    window.preloaded.act_input.onfocus = function() {
        window.preloaded.act_input.classList.add("input-focus");
        window.preloaded.act_input_data.classList.add("input-data-hover");
    };
    window.preloaded.act_input.onblur = function() {
        window.preloaded.act_input.classList.remove("input-focus");
        window.preloaded.act_input_data.classList.remove("input-data-hover");
    };
    window.preloaded.ina_input.onfocus = function() {
        window.preloaded.ina_input.classList.add("input-focus");
        window.preloaded.ina_input_data.classList.add("input-data-hover");
    };
    window.preloaded.ina_input.onblur = function() {
        window.preloaded.ina_input.classList.remove("input-focus");
        window.preloaded.ina_input_data.classList.remove("input-data-hover");
    };

    window.preloaded.arm_box_2L = window.preloaded.arm_boxes[0];
    window.preloaded.arm_box_2R = window.preloaded.arm_boxes[1];
    window.preloaded.arm_box_3L = window.preloaded.arm_boxes[2];
    window.preloaded.arm_box_3R = window.preloaded.arm_boxes[3];
	
    window.preloaded.enh_toggle = window.preloaded.sup_enh_toggles[0];
    window.preloaded.sup_toggle = window.preloaded.sup_enh_toggles[1];

    //An arbitrary toggle button is set here as a dummy DOM element for the first time radioSelector() is called
    window.button_states = {
        arm_panel: {
            sel_button: window.preloaded.arm_box_2L,
            prev_label: "arm_box_2L"
        },
        e_s_panel: {
            sel_button: window.preloaded.enh_toggle,
            prev_label: "enh_toggle"
            }
	};

    //Default selections
    radioSelector('arm_panel', 'arm_box_2L', true);
    radioSelector('e_s_panel', 'enh_toggle', true);

    //New data structure scaffold
    window.preloaded.dataset = {
        "2L": {},
        "2R": {},
        "3L": {},
        "3R": {}
    };

    window.preloaded.sub_dataset = function() {
        this.sup = {}; //Active regions: suppressors only
        this.enh = {}; //Active regions: enhancers only
        this.ina = {}; //All inactive regions
        this.rem = []; //Results from "computeRemaining"
    };

    window.preloaded.type_sub_dataset = function() {
        this.full = [];
        this.pre_rem = [];
        this.pre_col = [];
        this.passed = [];
    };

    window.preloaded.input_types = ["sup","enh","ina"];

    for (s_dataset in window.preloaded.dataset) {
        window.preloaded.dataset[s_dataset] = new window.preloaded.sub_dataset;

        for (t_s_dataset in window.preloaded.input_types) {
            var ipt_type = window.preloaded.input_types[t_s_dataset];

            window.preloaded.dataset[s_dataset][ipt_type] = new window.preloaded.type_sub_dataset;

            if (ipt_type !== "ina") {
                //Results from "eliminateOverlaps"
                window.preloaded.dataset[s_dataset][ipt_type]["elm"] = [];
                //Results from "collapseCoords"
                window.preloaded.dataset[s_dataset][ipt_type]["col"] = [];
            }
        }
    }

    preloaded.remaining_textbox.value = "";
    preloaded.collapse_textbox.value = "";

    return true;
};

var all_arms = ["2L", "2R", "3L", "3R"];
var splash = document.getElementById("loading_data");

//Removes "loading" text after data is loaded and passed to JS
splash.parentNode.removeChild(splash);

//Renaming inactive coordinate set name, "x" (from database) to more consistent, clear name
(function() {
    for (cur_arm in all_arms) {
        JSON_data[all_arms[cur_arm]]["ina"] = JSON_data[all_arms[cur_arm]]["x"];
        delete JSON_data[all_arms[cur_arm]]["x"];
    }
}());

function loadArmDB(arm) {
    res_types = window.preloaded.input_types;

    for (res_type in res_types) {
        var JSON_path = JSON_data[arm][res_types[res_type]];
        var DS_path = preloaded.dataset[arm][res_types[res_type]];
        var full_res = JSON_data[arm][res_types[res_type]]["full"];

        for (res in full_res) {
            var res_string = full_res[res]["str_id"];
            var passed_array = DS_path["passed"];

            if (passed_array.indexOf(full_res[res].str_id) === -1) {
                DS_path["full"].push(JSON_path["full"][res]);
                DS_path["pre_rem"].push(JSON_path["pre_rem"][res]);
                DS_path["pre_col"].push(JSON_path["pre_col"][res]);
                passed_array.push(res_string);
            }
        }
    }
    buildListbox();
}

function loadAllDataDB() {
    for (cur_arm in preloaded.dataset) {
        loadArmDB(cur_arm);
    }
}