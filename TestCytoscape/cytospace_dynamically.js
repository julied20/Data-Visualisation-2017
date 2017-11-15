var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'curve-style': 'unbundled-bezier'
        }
      }
    ]

});

cy.add({
    data: { id: 'origin', position: {x:0, y:0}}
  });

for (var i = 0; i < 10; i++) {
    cy.add({
        data: { id: 'node' + i }
        }
    );
    var source = 'node' + i;
    cy.add({
        data: {
            id: 'edge' + i,
            source: source,
            target: 'origin'
        }
    });
}

cy.layout({
    name: 'circle'
}).run();


cy.nodes().ungrabify()
