var editor_settings = {};
var editor_preview = {};

function ready(a) {
    "loading" != document.readyState ? a() : document.addEventListener("DOMContentLoaded", a);
}

function start() {
    // Set default config
    $.ajax({
        url: "./json/EditorSettings1.json",
        async: false,
        dataType: "json",
        success: function (data) {
            editor_settings = data;
        },
    });
    $.ajax({
        url: "./json/EditorPreview1.json",
        async: false,
        dataType: "json",
        success: function (data) {
            editor_preview = data;
        },
    });

    // Build buttons
    $("#editor").append(build_editor());

    // Generate consolevariables.ini file
    build_consolevariable_ini();

    // Generate preview
    generate_preview();

    // Setup stepper buttons
    document.addEventListener("touchstart", function () { }, false);
    stepper_setInputButtonState();
}
ready(start);

// Build editor
function build_editor() {
    var data = editor_settings;
    var data2;
    var html = '<div class="editor_table"><table><tbody>';
    for (var key in data) {
        html += "<!-- " + key + " -->";
        html += '<tr><td class="collapsible-section-header"><a data-bs-toggle="collapse" href="#' + key + '">';
        html += data[key]["Title"];
        html += '</a></td><td class="collapsible-section-header py-1">';
        html += data[key]["Description"];
        html += '</td><td class="collapsible-section-header">';
        html += build_switch(key, data[key]["Default"]);
        html += "</td></tr>";

        html += "<!-- Console_Variables -->";
        html += '<tr><td class="p-0" colspan="3">';
        html += '<div id="' + key + '" class="collapse multi-collapse">';
        html += '<table style="width:100%">';
        for (var key2 in data[key]["Console_Variables"]) {
            html += '<tr><td class="border-end-0" style="font-family: Andale Mono, monospace;">';
            html += data[key]["Console_Variables"][key2]["Name"]; // Name
            html += '</td><td class="py-1 border-start-0">';

            data2 = data[key]["Console_Variables"][key2];
            if (data2["Type"] == "stepper") {
                html += build_stepper(
                    data2["Id"],
                    data2["Value"],
                    data2["Min"],
                    data2["Max"],
                    data2["DataStep"]
                );
            } else if (data2["Type"] == "switch") {
                html += build_switch(data2["Id"], data2["Value"]);
            }
            html += "</td></tr>";
        }
        html += "</table></div></td></tr>";
    }
    html += "</tbody></table></div>";
    return html;
}
function build_switch(id, default_state) {
    var checked = "";
    if (default_state == "true") {
        checked = "checked";
    }
    var html = '<div class="ms-auto me-0" style="width: 80px;"><label class="switch">';
    html += '<input type="checkbox" class="switch-input" oninput="switch_ValueUpdate(event)" id="' + id + '" value="' + default_state + '" ' + checked + ">";
    html += '<span class="switch-label" data-on="On" data-off="Off"></span><span class="switch-handle"></span></label></div>';
    return html;
}
function build_stepper(id, default_value, min, max, datastep) {
    var html = '<div class="number-input-container ms-auto me-0">';
    html += '<button type="button" class="button-decrement" onclick="stepper_onbutton(event)" data-input-id="' + id + '" data-operation="decrement"></button>';

    html += '<div class="number-input"><input type="number" class="number-input-field" oninput="stepper_oninput()" onblur="stepper_onblur(event)" ';
    html += 'id="' + id + '" value="' + default_value + '" min="' + min + '" max="' + max + '" data-step="' + datastep + '"></div>';

    html += '<button type="button" class="button-increment" onclick="stepper_onbutton(event)" data-input-id="' + id + '" data-operation="increment"></button>';
    html += "</div>";

    return html;
}

// Build consolevariable.ini file
function build_consolevariable_ini() {
    return;
}

// Update consolevariable.ini file
function update_consolevariable_ini() {
    return;
}

// Generate preview image
function generate_preview() {
    var preview_image_src = document.getElementById("preview_image").src;
    var SettingsEnabled = " ";
    for (var key in editor_settings) {
        if ($("#" + key).val() == "true") {
            SettingsEnabled += key + " ";
        }
    }
    console.log(SettingsEnabled);
}

// On Editor Value updates
function ValueUpdate(type, id, value) {
    if (type == "switch") {
        if (id.startsWith("Setting_")) {
            generate_preview();
        }
        update_consolevariable_ini(type, id, value);
    }
    if (type == "stepper") {
        update_consolevariable_ini(type, id, value);
    }

    console.log("ValueUpdate:\ntype: " + type + ":\nid: " + id + "\nvalue: " + value);
}
function switch_ValueUpdate(event) {
    event.target.value = event.target.checked;
    ValueUpdate("switch", event.target.id, event.target.checked);
}
function stepper_ValueUpdate(event) {
    ValueUpdate("stepper", event.id, event.value);
}


// On button click
function button_settings(event) {
    $("#popup_settings").addClass("is-visible");
}
function button_createfile(event) {
    $("#popup_createfile").addClass("is-visible");
}
function closepopup(event) {
    if ($(event.target).is(".popup-close") || $(event.target).is(".popup")) {
        $(".popup").removeClass("is-visible");
    }
}

// Stepper functions
function stepper_oninput(event) {
    stepper_setInputButtonState();
    stepper_ValueUpdate(event.target);
}
function stepper_onblur(event) {
    const value = event.target.value;

    if (event.target.hasAttribute("min") && value < parseFloat(event.target.min))
        event.target.value = event.target.min;

    if (event.target.hasAttribute("max") && value > parseFloat(event.target.max))
        event.target.value = event.target.max;
    stepper_ValueUpdate(event.target);
}
function stepper_onbutton(event) {
    let button = event.target;
    let input = document.getElementById(button.dataset.inputId);

    if (input) {
        let value = parseFloat(input.value);
        let step = parseFloat(input.dataset.step);

        if (button.dataset.operation === "decrement") {
            value -= isNaN(step) ? 1 : step;
        } else if (button.dataset.operation === "increment") {
            value += isNaN(step) ? 1 : step;
        }

        if (input.hasAttribute("min") && value < parseFloat(input.min)) {
            value = input.min;
        }

        if (input.hasAttribute("max") && value > parseFloat(input.max)) {
            value = input.max;
        }

        if (input.value !== value) {
            stepper_setInputValue(input, value);
            input.value = value;
            stepper_ValueUpdate(input);
            stepper_setInputButtonState();
        }
    }
}
function stepper_setInputValue(input, value) {
    let newInput = input.cloneNode(true);
    const parentBox = input.parentElement.getBoundingClientRect();

    input.id = "";

    newInput.value = value;

    if (value > input.value) {
        // right to left
        input.parentElement.appendChild(newInput);
        input.style.marginLeft = -parentBox.width + "px";
    } else if (value < input.value) {
        // left to right
        newInput.style.marginLeft = -parentBox.width + "px";
        input.parentElement.prepend(newInput);
        window.setTimeout(function () {
            newInput.style.marginLeft = 0;
        }, 20);
    }

    window.setTimeout(function () {
        input.parentElement.removeChild(input);
    }, 250);
}
function stepper_setInputButtonState() {
    const inputs = document.getElementsByClassName("number-input-text-box");

    for (let input of inputs) {
        if (input.id.length > 0) {
            // during value transition the old input won't have an id
            const value = input.value;
            const parent = input.parentElement.parentElement;

            if (parent.children[0] && input.hasAttribute("min"))
                parent.children[0].disabled = value <= parseFloat(input.min);

            if (parent.children[2] && input.hasAttribute("max"))
                parent.children[2].disabled = value >= parseFloat(input.max);
        }
    }
}

// logo hovered
function logo(image) {
    image.src = "images/gear.png";
}
function logo_hovered(image) {
    image.src = "images/gear_hovered.png";
}
