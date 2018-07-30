'use strict';

function radioSelector(panel_name, button_label, init) {
    /*
     * Controls display of light colored border around Arm Selection Boxes
     * Deletes and re-applies 'onclick' attribute to selected boxes to prevent
     * additional function calls when the same box is clicked repeatedly
     */
    var states = button_states[panel_name];

    states.sel_button.classList.remove('choose-box-active');
    states.sel_button.setAttribute('onclick', "radioSelector(\'" + panel_name + "\',\'" + states.prev_label + "\')");
    states.sel_button = window.preloaded[button_label];
    states.prev_label = button_label;
    preloaded[button_label].removeAttribute('onclick');
    preloaded[button_label].classList.add('choose-box-active');

    if (button_label === 'enh_toggle') {
        preloaded.active_title.childNodes[0].nodeValue = 'Enhancers';
    }
    else if (button_label === 'sup_toggle') {
        preloaded.active_title.childNodes[0].nodeValue = 'Suppressors';
    }

    // The 'init' argument specifies if the function is being called at startup
    if (init === undefined) {
        buildListbox();
    }
}

// Results from displayed algorithms are simply displayed, so only the display textarea is cleared
function fullDeleteClear(type) {
    if (type === 'rem') {
        preloaded.remaining_textbox.value = '';
    }
    else if (type === 'col') {
        preloaded.collapse_textbox.value = '';
    }
    else if (type === 'sup' || type === 'enh' || type === 'ina') {
        deleteAllInput(type);
    }
}

function showInstructions() {
    var $detailedInstructions = $('#det-ins');

    $detailedInstructions.append(
        '<p>' +
        'Enter the active/inactive region coordinates into their respective input forms. ' +
        'These can be typed in manually one at a time, or many at once, with each ' +
        'region separated by a single space. These can also be added by copying (sorted) ' +
        'columns from an excel file and pasting the results into their respective input boxes.' +
        '</p>' +
        '<p>The format should be as follows:</p>' +
        '<p>[A1];[A2] [B1];[B2]</p>' +
        '<p>e.g.: 100;200 200;300 300;400 etc.</p>' +
        '<p>' +
        'Please ensure that left and right bounds are separated by a semicolon (;) ' +
        'and that only <em>spaces</em> separate each region. When ready to submit, ' +
        'press enter on your keyboard. You may <strong>delete</strong> any single coordinate from either ' +
        'of the two input boxes by selecting them and pressing the delete key on your keyboard.' +
        '</p>'
    );

    $detailedInstructions.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        closeText: null,
        close: function () {
            $detailedInstructions.empty();
        }
    });

    // jQuery UI horizontal and vertical centering fix
    $detailedInstructions.dialog('widget').attr('id', 'fixed-det-ins');

    $('#fixed-det-ins').css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'margin-top': '-259px',
        'margin-left': '-150px'
    });
}

function displayWarning(message) {
    var $warningText = $('#warning-text');

    $warningText.append('<p>' + message + '</p>');
    $warningText.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        closeText: null,
        width: 300,
        close: function () {
            $('#warning-text').empty();
        }
    });

    $warningText.dialog('widget').attr('id', 'fixed-warning-text');

    $('#fixed-warning-text').css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'margin-top': '-108px', // Auto height for current font and width is 216px
        'margin-left': '-150px'
    });
}

function confirmClear(type) {
    type = type === 'act' ? type = button_states.e_s_panel.prev_label.substr(0, 3) : type;
    var $dialogConfirm = $('#dialog-confirm');

    var messages = {
        sup: 'suppressor region coordinates?',
        enh: 'enhancer region coordinates?',
        ina: 'inactive region coordinates?',
        rem: 'results from Remaining?',
        col: 'results from Collapse?'
    };

    $dialogConfirm.text('Clear all ' + messages[type]);
    $dialogConfirm.dialog({
        resizable: false,
        draggable: false,
        height: 140,
        modal: true,
        title: 'Confirm Input Removal',
        closeText: null,
        buttons: {
            'Clear All': function () {
                $(this).dialog('close');
                fullDeleteClear(type);
            },
            'Cancel': function () {
                $(this).dialog('close');
            }
        }
    });
    $('.ui-dialog-titlebar-close').removeAttr('title');

    $dialogConfirm.dialog('widget').attr('id', 'fixed-dialog-confirm');

    $('#fixed-dialog-confirm').css({
        'top': '50%',
        'margin-top': '-70px',
        'left': '50%',
        'margin-left': '-151px',
        'position': 'fixed'
    });
}

function buildSelect(display_index) {
    var cur_type;
    var cur_arm = button_states.arm_panel.prev_label.substr(8, 9);
    var boxtype = window.preloaded.displays[display_index];

    if (display_index === 0) {
        cur_type = button_states.e_s_panel.prev_label.substr(0, 3);
    } else if (display_index === 1) {
        cur_type = 'ina';
    }

    var working_array = preloaded.dataset[cur_arm][cur_type].passed;
    boxtype.options.length = 0;

    for (var coord_index in working_array) {
        if (working_array[coord_index] === ' ') {
            continue;
        }
        var newCoordinatesEl = document.createElement('option');

        newCoordinatesEl.value = working_array[coord_index];
        newCoordinatesEl.text = working_array[coord_index];
        boxtype.add(newCoordinatesEl, null);
    }
}

function buildTextarea(display_index) {
    var working_array;
    var cur_arm = button_states.arm_panel.prev_label.substr(8, 9);
    var cur_type = button_states.e_s_panel.prev_label.substr(0, 3);
    var boxtype = window.preloaded.displays[display_index];

    if (display_index === 2) {
        working_array = preloaded.dataset[cur_arm].rem;
    } else if (display_index === 3) {
        working_array = preloaded.dataset[cur_arm][cur_type].col;
    }

    var result_text = '';
    for (var i = 0; i < working_array.length; i++) {
        result_text += working_array[i] + '\n';
    }

    boxtype.value = result_text.trim();
}

function buildListbox(display_index) {
    // With no arguments, this function displays data in all display boxes
    if (display_index === undefined) {
        var build_all = true;
        display_index = 0;
    }

    switch (display_index) {
        case 0: // Active inputs
            buildSelect(0);
            if (!build_all) {
                break;
            }
        case 1: // Inactive inputs
            buildSelect(1);
            if (!build_all) {
                break;
            }
        case 2: // Remaining results
            buildTextarea(2);
            if (!build_all) {
                break;
            }
        case 3: // Collapse results
            buildTextarea(3);
            if (!build_all) {
                break;
            }
        default:
            return [0, 1, 2, 3].indexOf(display_index) !== -1;
    }
}
