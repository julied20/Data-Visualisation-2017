let map_container = d3.select("#map_container");
let network_container = d3.select("#network_container");

const width = map_container.node().getBoundingClientRect().width;
const height = 600;


const svg = map_container.append("svg")
    .attr("width", width)
    .attr("height", height);

const map_group = svg.append("g");

// D3 Projection
const projection = d3.geoMercator()
    .rotate([0, 0])
    .translate([width / 2, height / 2]);


// Path generator to convert JSON to SVG paths
const path = d3.geoPath()
    .projection(projection);


// Tooltip
const tooltip = svg.append("g")
    .style("display", "none");

tooltip.append("rect")
    .attr("width", 100)
    .attr("height", 50)
    .attr("fill", "white")
    .style("opacity", 0.7);

tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
