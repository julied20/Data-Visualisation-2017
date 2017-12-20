// Div containing the map
let map_div = d3.select("#map_div");

// Div containing the cytoscape network (trade arrows)
let network_div = d3.select("#network_div");

// Dynamic size on page load, but not responsive on resize :'(
const width = map_div.node().getBoundingClientRect().width;
const height = map_div.node().getBoundingClientRect().height;

// Create svg for the map
const svg = map_div.append("svg")
    .attr("width", width)
    .attr("height", height);

// Group to contain all countries shapes
const map_group = svg.append("g");

// D3 Projection
const projection = d3.geoMercator()
    .rotate([0, 0])
    .translate([width / 2, height / 1.3]);


// Path generator to convert JSON to SVG paths
const path = d3.geoPath()
    .projection(projection);
