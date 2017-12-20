let svg = d3.select("svg");

const box = svg.node().getBoundingClientRect();
const width = box.width;
const height = box.height;

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-15000).distanceMax(500).distanceMin(100))
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("static/home_graph_data.json", function(error, graph) {
    if (error) throw error;

    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    let nodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll()
        .data(graph.nodes)
        .enter()
        .append('a')
        .style('cursor', 'pointer')
            .attr('href', function(d) { return d.link })
        .append('g')


    nodes.append('circle')
          .attr("r", (d) => { return d.size })
          .attr("fill", "rgba(203, 56, 85, 1)")
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    nodes.append("text")
        .attr('class', 'label')
        .attr('x', function(d){
             if (d.id == "Visualisation") {
                 return 75;
             } else {
                 return 50;
             }
        })
        .attr('y', 0)
        .text(function(d) { return d.id });

        nodes.append('image')
            .attr('width', (d) => { return d.size * 1.2 + "px" })
            .attr('height', (d) => { return d.size * 1.2 + "px" })
            .attr('xlink:href', (d) => {return 'static/img/icons/' + d.icon})

    // nodes.append("text")
    //     .attr('class', 'icon')
    //     .style('font-size', function (d) {
    //          if (d.id == "Visualisation") {
    //              return '80px';
    //          } else {
    //              return '40px';
    //          }
    //     })
    //     .attr('x', function (d) {
    //         if (d.id == "Visualisation") {
    //             return '-33';
    //         } else {
    //             return '-16';
    //         }
    //     })
    //     .attr('y', function (d) {
    //         if (d.id == "Visualisation") {
    //             return '26';
    //         } else {
    //             return '12';
    //         }
    //     })
    //     .attr('fill', 'white')
    //     .html(function(d) { return d.icon })

    let node = nodes.selectAll('circle')
    let label = nodes.selectAll('text')
    let icons = nodes.selectAll('image')



    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        label
            .attr("dx", function(d) { return d.x; })
            .attr("dy", function(d) { return d.y; });

        icons
            .attr("x", function(d) { return d.x - d.size * 0.59; })
            .attr("y", function(d) { return d.y - d.size * 0.59; });
        }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
