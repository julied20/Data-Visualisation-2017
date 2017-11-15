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

// Artificially fix a Year
let year = 2015;

// Color each country
d3.csv("datasets/belgium_beers_all_clean.csv", function(data) {
    d3.json("world.geo.json", function(json) {
        const features = json.features;

        data = data.filter(x => x.Year == "2015")

        // Find threshold for values, so that cumulative values cover a given
        // percentage of the data
        const value_coverage = 0.8
        const total_value = data.filter(x => x.PartnerISO == "WLD")[0].Value

        // Remove World
        data = data.filter(x => x.PartnerISO != "WLD")

        // Descending sorted values
        let values = data.map(x => parseInt(x.Value)).sort((a, b) => b - a);
        let value_threshold;

        // Find threshold
        cum_value = 0
        for (let i = 0; i < values.length; i++) {
            cum_value += values[i];

            if (cum_value >= total_value * value_coverage) {
                value_threshold = values[i];
                break;
            }
        }

        svg.selectAll("path")
            .data(features)
            .enter()
            .append("path")
            .attr('d', path)
            .style("fill", feat => {
                let corresponding_data = data.filter(x => x.PartnerISO == feat.properties.iso_a3);

                // Corresponding data is found and value is bigger than threshold
                if (corresponding_data.length == 1 && corresponding_data[0].Value >= value_threshold) {
                    return d3.color("steelblue");
                } else {
                    return d3.color("lightgrey");
                }
            });
    });
});

function mouseover(d){
  // Highlight hovered country
  d3.select(this).style('fill', 'orange');
}

// Get coordinate of country given ISO3 code
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
