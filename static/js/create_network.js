// Create the cytoscape network (trade arrows)

/* Compute threshold above which a country is considered big trader. The sum of
all the big traders trade covers <value_coverage> of all the trades */
function compute_big_trader_threshold(data) {

    const value_coverage = 0.8
    const total_value = data.filter(x => x.PartnerISO == "WLD")[0].Value

    // Remove World
    data = data.filter(x => x.PartnerISO != "WLD")

    // Descending sorted values
    let values = data.map(x => parseInt(x.Value)).sort((a, b) => b - a);

    // Find threshold
    cum_value = 0
    for (let i = 0; i < values.length; i++) {
        cum_value += values[i];

        if (cum_value >= total_value * value_coverage) {
            return values[i];
        }
    }
}

// Convenience function to get a country by ISO
function get_country(ISO) {
    return countries.find(x => find_by_ISO(x, ISO));
}

// Returns country if it matches to corresponding ISO
function find_by_ISO(country, ISO) {
    if (country.ISO3 == ISO) {
      return country
    }
}

// Sums the total values of the trades for the world
function get_trades_total() {
    let total_trades = stories_data[current_story]
        .filter(x => x.PartnerISO == "WLD")
        .map(x => parseInt(x.Value))
        .reduce((x,y) => x + y);
    return total_trades;
}

// Return the minimum and maximum trade among the big traders
function min_max_bigtraders() {
    min = Number.MAX_SAFE_INTEGER;
    max = 0;

    big_traders.forEach(function(ISO) {
        stories_data[current_story]
            .filter(x => x.PartnerISO == ISO)
            .map(x => parseInt(x.Value))
            .forEach(function(value) {
                if (value > max) {
                    max = value;
                }
                if (value < min) {
                    min = value;
                }
            })
    })
    return [min, max];
}

// Computes the weight of the edge proportionally to the value of the trade and
// the zoom_level
function get_arrow_weight(ISO, zoom_level) {
    let country = countries.find(x => find_by_ISO(x, ISO));
    let weight = (1 / zoom_level) * arrow_weight_scale(country.trade_value);
    return weight;
}

// Compute the distance for the control-point of the bezier curve
function get_control_point_distance(source_geo, target_geo) {
    // Distance between source and target
    let dist = Math.sqrt(
        Math.pow(source_geo.x - target_geo.x,2) +
        Math.pow(source_geo.y - target_geo.y,2));

    /* Magic numbers that make a nice curve, taking account the distance with
    a 2 / 3 power (scales nicely), some constants, and the signed x-distance
    between source and target so that all arrows curve to the north*/
    return 1 / 3 * Math.pow(dist, 2 / 3) * 0.02 * (source_geo.x - target_geo.x);
}

// Big traders list
let bigtraders = [];

// Cytoscape object for network
let cy = cytoscape({
      container: document.getElementById('network_div'),
      style: [
        {
          selector: 'node',
          style: {
            /* Almost invisible nodes works better than invisible nodes, for an
            obscure reason*/
            'width': 0.01,
            'height' : 0.01
          }
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'unbundled-bezier',
            'control-point-distances': e => get_control_point_distance(
                e.source().position(),e.target().position()),
            'control-point-weights': '0.5',
            'edge-distances': 'node-position',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': e => stories[current_story].color,
            'arrow-scale': 1.2,
            'opacity' : 0.9
            }
          },

        {
          selector: 'edge:active',
  				style: {
            "selection-box-color": "#ddd",
  					"selection-box-opacity": 0.65,
  					"selection-box-border-color": "#aaa",
  					"overlay-opacity": 0
  				},
        },
      ],

        layout: {
          name: 'preset'
        },

        zoom: 1,
        pan: { x: 0, y: 0 },

        /* No user interaction, since the zoom and pan is mapped to the 
        d3 events */
        zoomingEnabled: true,
        userZoomingEnabled: false,
        panningEnabled: true,
        userPanningEnabled: false,

  });



function update_graph() {

    cy.elements().remove();

    // Creates the big traders list
    bigtraders = [];
    countries.forEach(function(country) {
        if (country.is_big_trader) {
            bigtraders.push(country)
        }
    });

    let origin_country = countries.find(x => find_by_ISO(x, stories[current_story].ISO3));
    let origin_coords = projection([origin_country.long, origin_country.lat]);

    // Adds the exporter country node
    cy.add({
        data: { id: 'exporter' },
        position: {x: origin_coords[0], y: origin_coords[1] }
    });

    for (let i = 0; i < bigtraders.length; i++) {
        let coordinates = projection([bigtraders[i].long, bigtraders[i].lat]);

        // Adds the big traders nodes
        cy.add({
            data: { id: bigtraders[i].ISO3 } ,
            position: { x : coordinates[0], y : coordinates[1] },
            style: {
                'background-color': country_color_scale(bigtraders[i].trade_value)
            }
        });

        // Adds an edge between each big trader and the exporter country
        cy.add({
            data: {
                id: 'Edge' + bigtraders[i].ISO3,
                source: 'exporter',
                target: bigtraders[i].ISO3
            },
            // Adapts the shape of the arrow depending on the zoom level
            style: {
                'line-color': stories[current_story].color,
                'width': get_arrow_weight(bigtraders[i].ISO3, zoom_level),
                'arrow-scale': Math.min(1, get_arrow_weight(bigtraders[i].ISO3, zoom_level)),
            }
        });
    }
}

function update_edges_zoom() {

    big_traders.forEach(iso => {
        cy.getElementById("Edge"+iso).style('width',
            get_arrow_weight(iso, zoom_level));
        cy.getElementById("Edge"+iso).style('arrow-scale',
            Math.min(1, get_arrow_weight(iso, zoom_level)));
    });
}

function update_edges_click() {

    big_traders.forEach(iso => {
        cy.getElementById("Edge"+iso).animate({
            style: {
                'width': get_arrow_weight(iso, zoom_level),
                'arrow-scale': Math.min(1, get_arrow_weight(iso, zoom_level)),
            }
        }, {
            duration: 100
        },
    );
    });
}

// Zoom level
let zoom_level = 1;

let zoom = d3.zoom()
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed() {
  if(!story_mode) {
    // Changes the zoom_level
    zoom_level = d3.event.transform.k;
    map_group.attr("transform", d3.event.transform);

    // Updates the graph especially for the edges shapes
    update_edges_zoom();

    // Changes the zoom level and the pan parameters to keep the correspondance
    // between the map and the graph
    cy.viewport({
        zoom: zoom_level,
        pan: {
            x: d3.event.transform.x,
            y: d3.event.transform.y,
        }
    });
  }
}
