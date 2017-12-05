function compute_big_trader_threshold(data) {

    // Find threshold for values, so that cumulative values cover a given
    // percentage of the data
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


function find_by_ISO(country, ISO) {
    if (country.ISO3 == ISO) {
      return country
    }
}

function get_trades_total() {
    let total_trades = stories_data[current_story].
        filter(x => x.PartnerISO == "WLD")
        .map(x => parseInt(x.Value))
        .reduce((x,y) => x + y);
    return total_trades;
}

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


function get_arrow_weight(ISO, zoom_level) {
    let country = countries.find(x => find_by_ISO(x, ISO));
    let weight = (1/zoom_level) * arrow_weight_scale(country.trade_value);
    return weight;
}

// Compute the distance for the control-point of the bezier curve
function get_control_point_distance(source_geo, target_geo) {
    let dist = Math.sqrt(
        Math.pow(source_geo.x - target_geo.x,2) +
        Math.pow(source_geo.y - target_geo.y,2));

    return 1/3 * Math.pow(dist,2/3) * 0.02 * (source_geo.x - target_geo.x);;

}

let cy = cytoscape({
      container: document.getElementById('network_div'),
      style: [ // the stylesheet for the graph,
        {
          selector: 'node',
          style: {
            'background-color': '#FF0000',
      //      'label': 'data(id)',
            'width': 0.1,
            'height' : 0.1
          }
        },

        {
          selector: 'edge',
          style: {
    //        'label' : 'data(id)',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': function(e){
                return get_control_point_distance(e.source().position(),
                                    e.target().position());
            },
            'control-point-weights': '0.5',
            'edge-distances': 'node-position',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': function(elem) {
                return stories[current_story].color;
            },
            'opacity' : 1
            },

          },
        {
          selector: 'edge:active',
  				style: {
            "selection-box-color": "#ddd",
  					"selection-box-opacity": 0.65,
  					"selection-box-border-color": "#aaa",
  					"overlay-opacity": 0
  				}
        },
      ],

        layout: {
          name: 'preset'
        },

        // Manually tweaked value to align the points on the countries
        zoom: 1,
        pan: { x: 0, y: 0 },

        // interaction options:
        zoomingEnabled: true,
        userZoomingEnabled: false,
        panningEnabled: true,
        userPanningEnabled: false,

  });



function update_graph() {

    cy.elements().remove();

    let bigtraders = [];

    countries.forEach(function(country) {
        if (country.is_big_trader) {
            bigtraders.push(country)
        }
    });

    let origin_country = countries.find(x => find_by_ISO(x, stories[current_story].ISO3));
    let origin_coords = projection([origin_country.long, origin_country.lat]);

    cy.add({
        data: { id: 'exporter' }, position: {x: origin_coords[0], y: origin_coords[1] }
    });

    for (let i = 0; i < bigtraders.length; i++) {
        let value_coord = projection([bigtraders[i].long, bigtraders[i].lat]);

        cy.add({
            data: { id: bigtraders[i].ISO3, width: 10} ,
            position : { x : value_coord[0], y : value_coord[1]  }
        });

        cy.add({
            data: {
                id: 'Edge' + bigtraders[i].ISO3,
                source: 'exporter',
                target: bigtraders[i].ISO3
            },
            style: {
                'line-color': function(elem) {
                    return stories[current_story].color;
                },
                'width': function(elem){
                    return get_arrow_weight(bigtraders[i].ISO3, zoom_level);
                },
                'arrow-scale': function(elem){
                    return Math.min(1, get_arrow_weight(bigtraders[i].ISO3, zoom_level));
                },
            }
        });
    }
}


// Zoom
let zoom_level = 1;

let zoom = d3.zoom()
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed() {
  zoom_level = d3.event.transform.k;
  map_group.attr("transform", d3.event.transform);

  update_graph();

  cy.viewport({
      zoom: zoom_level,
      pan: {
          x: d3.event.transform.x,
          y: d3.event.transform.y,
      }
  });
}
