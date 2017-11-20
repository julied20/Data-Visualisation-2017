let nodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function defineWeight(nodes, edge_index){
  return nodes[edge_index];
}

var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          //'background-color': ,
          //'visibility': 'hidden',
          'width': 0.1,
          'height':0.1
        }
      },

      {
        selector: 'edge',
        style: {
          'line-color': '#FF0000',
          'width':  function( ele ){ return ele.data('weight') },
          'curve-style': 'unbundled-bezier',
          'edge-distances': 'node-position'

        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#0000ff',
          'opacity': 1,
          // We can display here info on the trade
          'target-label': 'data(id)'
        }
      }
    ]

});


cy.add({
    data: { id: 'origin', position: {x:0, y:0}}
});

for (let i = 0; i < 10; i++) {
    cy.add({
        data: {
          id: 'node' + i
        }
    });

    let target = 'node' + i;
    cy.add({
        data: {
            id: 'edge' + i,
            source: 'origin',
            target: target,
            weight: i
        }
    });
}



cy.layout({
    name: 'circle'
}).run();


cy.nodes().ungrabify()
