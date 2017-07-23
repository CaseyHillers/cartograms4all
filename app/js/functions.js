// DATASHEET CONFIG
var DEFAULT_DATA = "data/nst_2011.csv";
var DEFAULT_TOPO = "data/us-states.topojson";
var USER_DIRECTORY = "uploader/upload/";
var DATA_DIRECTORY = "data/";
var USER_CSV; // holds object containing .csv file
var CSV_URL; // DOMString containing URL representing USER_CSV

var fields;
var states;

//Return usable object from CSV file
function getCSVFields(callback, CSV) {
    var dataset = Papa.parse(CSV, {
        download: true,
        complete: function(results) {
            return parseFields(results.data, callback);
        }
    });
}

function generateSessionID(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';

    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// writes string_to_save to app/php/settings/<session_id>.json
function writeToServer(session_id, string_to_save) {
    var data = new FormData();
    data.append("data", string_to_save);
    data.append("name", session_id);
    var XHR = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    XHR.open('post', 'php/importSettings.php', true);
    XHR.send(data);
}

// returns contents from app/php/settings/<session_id>.json as a string
function readFromServer(session_id) {
    var return_string;
    var data = new FormData();
    data.append("name", session_id);
    var XHR = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    //XHR.responseType = 'text';
    XHR.onload = function() {
        if (XHR.readyState === XHR.DONE) {
            return_string = XHR.responseText;
        }
    }
    XHR.open('post', 'php/exportSettings.php', false);
    XHR.send(data);
    return return_string;
}

//Save CSV to uploader/upload path via an ajax call
//The saved CSV can be use for other user as it is public
function saveCSV(userCSV) {

    var data = new FormData();
    data.append("input_csv", userCSV);

    $.ajax({
        url: 'uploader/upload-manager.php',
        type: 'POST',
        data: data,
        cache: false,
        processData: false, // Don't process the files
        contentType: false, // jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // Success so call function to process the form
                //submitForm(event, data);
                console.log('Success' + textStatus);
            } else {
                // Handle errors here
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('ERRORS: ' + textStatus);
        }
    });
}

//Send fields array back inside the called function
function parseFields(data, callback) {
    fields = [];
    fields.push({
        name: "None",
        id: "none"
    });
    for (var i = 0; i < data[0].length; i++) {
        var field = data[0][i];
        fields.push({
            name: field,
            id: field,
            key: field
        });
    }
    callback(fields);
}

//no idea what this does yet, to be honest. I'm assuming something on the browser side
function updateZoom() {
    var scale = zoom.scale();
    layer.attr("transform",
        "translate(" + zoom.translate() + ") " +
        "scale(" + [scale, scale] + ")");
}

//get  from the nitty gritty cartogram function in cartogram.js
function initTopo() {
    var features = carto.features(topology, geometries),
        path = d3.geo.path()
        .projection(proj); //d3.geo.path is d3's main drawing function
    states = states.data(features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("id", function(d) {
            return d.properties.NAME;
        })
        .attr("fill", "#fff")
        .attr("d", path);

    states.append("title");

    parseHash();
}

/*
 * Original graph that is loaded
 */
function reset() {
    stat.text("");
    body.classed("updating", false);

    var features = carto.features(topology, geometries),
        path = d3.geo.path()
        .projection(proj);

    states.data(features)
        .transition()
        .duration(750)
        .ease("linear")
        .attr("fill", "#fff")
        .attr("d", path);

    states.select("title")
        .text(function(d) {
            return d.properties.NAME;
        });
}

function update() {
  var start = Date.now();

    var key = field.key;
    var fmt = (typeof field.format === "function") ?
        field.format :
        d3.format(field.format || ","),
        value = function(d) {
            return +d.properties[key];
        },
        values = states.data()
        .map(value)
        .filter(function(n) {
            return !isNaN(n);
        })
        .sort(d3.ascending),
        lo = values[0],
        hi = values[values.length - 1];

  var color = d3.scale.linear()
    .range(colors)
    .domain(lo < 0 ? [lo, 0, hi] : [lo, d3.mean(values), hi]);

    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);

    // tell the cartogram to use the scaled values
    carto.value(function(d) {
        return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = carto(topology, geometries).features;


    // update the data
    states.data(features)
        .select("title")
        .text(function(d) {
            return [d.properties.NAME, fmt(value(d))].join(": ");
        });

    states.transition()
        .duration(750)
        .ease("linear")
        .attr("fill", function(d) {
            return color(value(d));
        })
        .attr("d", carto.path);

  var delta = (Date.now() - start) / 1000;
}


function parseHash(fieldsById) {
    var parts = location.hash.substr(1).split("/"),
        desiredFieldId = parts[0],
        desiredYear = +parts[1];

    var field = fieldsById[desiredFieldId] || fields[0];

    fieldSelect.property("selectedIndex", fields.indexOf(field));

    if (field.id === "none") {

        //yearSelect.attr("disabled", "disabled");
        reset();

    } else
        /*
                if (field.years) {
                    if (field.yecs.indexOf(year) === -1) {
                        year = field.years[0];
                    }
                    yearSelect.selectAll("option")
                        .attr("disabled", function(y) {
                            return (field.years.indexOf(y) === -1) ? "disabled" : null;
                        });
                } else {
                    yearSelect.selectAll("option")
                        .attr("disabled", null);
                }
    } else

                yearSelect
                    .property("selectedIndex", years.indexOf(year))
                    .attr("disabled", null);
        */
    deferredUpdate();
    location.replace("#" + field.id);

    hashish.attr("href", function(href) {
        return href + location.hash;
    });
}

//Inital map setup
var map = d3.select("#map"),
    zoom = d3.behavior.zoom()
    .translate([-38, 32])
    .scale(0.94)
    .scaleExtent([0.1, 20.0])
    .on("zoom", updateZoom),
    layer = map.append("g")
    .attr("id", "layer"),
    states = layer.append("g")
    .attr("id", "states")
    .selectAll("path")
    .call(zoom);

    updateZoom();
