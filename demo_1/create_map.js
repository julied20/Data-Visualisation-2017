let map_container = d3.select("#map_container");

const width = map_container.node().getBoundingClientRect().width;
const height = 600;

const svg = map_container.append("svg")
    .attr("width", width)
    .attr("height", height);

const map_group = svg.append("g");

// D3 Projection
const projection = d3.geoNaturalEarth1()
    .rotate([0, 0])
    .translate([width / 2, height / 2]);


// Path generator to convert JSON to SVG paths
const path = d3.geoPath()
    .projection(projection);
