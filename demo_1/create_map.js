const svg = d3.select("body").append("svg")
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

const tooltip = svg.append("g")
    .style("display", "none");

tooltip.append("rect")
    .attr("width", 100)
    .attr("height", 50)
    .attr("fill", "black")
    .style("opacity", 0.7);

tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
