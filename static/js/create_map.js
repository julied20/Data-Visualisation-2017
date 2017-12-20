let map_div = d3.select("#map_div");
let network_div = d3.select("#network_div");

const width = map_div.node().getBoundingClientRect().width;
const height = map_div.node().getBoundingClientRect().height;


const svg = map_div.append("svg")
    .attr("width", width)
    .attr("height", height);

const map_group = svg.append("g");

// D3 Projection
const projection = d3.geoMercator()
    .rotate([0, 0])
    .translate([width / 2, height / 1.3]);


// Path generator to convert JSON to SVG paths
const path = d3.geoPath()
    .projection(projection);

const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

gradient.append("stop")
    .attr('offset', '0%')
    .attr('stop-color', '#f2f2f2');

gradient.append("stop")
    .attr('offset', '100%')
    .attr('stop-color', '#5e5e5e');

svg.append('rect')
    .attr('id', 'legend')
    .attr('width', 200)
    .attr('height', 20)
    .style("fill", "url(#gradient)")
svg.append('text')
    .attr('position', 'relative')
    .attr('x', '70%')
    .attr('y', '84%')
    .attr('z-index', '500')
    .attr("dy", "5em")
    .text('Importance of trades')
