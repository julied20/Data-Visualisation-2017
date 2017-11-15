const width = 900
const height = 600

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv('datasets/countries_codes_and_coordinates.csv', loadIsoCoord);

let iso_geo_coord;

function loadIsoCoord(CSV) {
    iso_geo_coord = CSV;
}

// D3 Projection
const projection = d3.geoNaturalEarth1()
    .rotate([0, 0])
    .translate([width / 2, height / 2]);


// Path generator to convert JSON to SVG paths
const path = d3.geoPath()
    .projection(projection);


// Colormap
const color = d3.scaleLog()
	.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
	.interpolate(d3.interpolateHcl);

d3.json("world.geo.json", function(json) {
    const features = json.features;

    svg.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr('d', path)
        .style("fill", (d) => {
            const mapcolor = d.properties.mapcolor7;
            return color(mapcolor);
        });
});

function mouseover(d){
  // Highlight hovered country
  d3.select(this).style('fill', 'orange');
}

function getCoordinates(ISO) {
    const country = iso_geo_coord.filter(x => x.ISO3 == ISO)[0];

    if(typeof country !== "undefined") {

        const obj = {
            latitude: parseFloat(country.Latitude),
            longitude: parseFloat(country.Longitude),
        };

        return obj;
    }
}
