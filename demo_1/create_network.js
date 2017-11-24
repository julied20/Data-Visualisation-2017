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

function findByISO(country, ISO){
    if (country.ISO3 == ISO) {
      return country
    }
}

var cy = cytoscape({
      container: document.getElementById('map_container'),
      style: [ // the stylesheet for the graph,
        {
          selector: 'node',
          style: {
            'background-color': '#FF0000',
          //  'label': 'data(id)',
            'width': 0.1,
            'height' : 0.1
          }
        },

        {
          selector: 'edge',
          style: {
            'line-color': '#FF0000',
//            'width':  function( ele ){ return ele.data('weight') },
            'curve-style': 'unbundled-bezier',
            'edge-distances': 'node-position',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#FF0000',
            'opacity' : 0.5
            }
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
        panningEnabled: false,
        userPanningEnabled: false,

  });

function create_graph() {

  let bigtraders = [];

  countries.forEach(function(country) {
    if (country.is_big_trader) {
      bigtraders.push(country)
    }
  });

  let origin_country = countries.find(x => findByISO(x,'BEL'));
  let origin_coords = projection([origin_country.long, origin_country.lat]);

  cy.add({
    data: { id: 'BELGIQUE' }, position: {x: origin_coords[0], y: origin_coords[1] }
  });

  for (var i = 0; i < bigtraders.length; i++) {
    let value_coord = projection([bigtraders[i].long, bigtraders[i].lat]);

    cy.add({
      data: { id: bigtraders[i].ISO3} , position : { x : value_coord[0], y : value_coord[1]  }
    });

    cy.add({
      data: {
        source: 'BELGIQUE',
        target: bigtraders[i].ISO3
      }
    });
  }
}
