const width = 900
const height = 600

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

const map_group = svg.append("g");

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

// Artificially fix a Year
let current_year = 2015;

let belgium_data;

let countries = [];

// Color each country
d3.csv("datasets/belgium_beers_all_clean.csv", function(data) {
    d3.json("world.geo.json", function(world_json) {
        // Clone data
        belgium_data = {...data};

        data_curr_year = data.filter(x => x.Year == current_year)

        let big_trader_threshold = compute_big_trader_threshold(data_curr_year);

        for (let geo_feat of world_json.features) {

            let ISO3 = geo_feat.properties.iso_a3;

            if(ISO3 == "WLD") {
                continue;
            }

            let is_big_trader = false;
            let trade_value = 0.0;
            let trade_weight = 0.0;

            let corresponding_data = data_curr_year.filter(x => x.PartnerISO == ISO3);


            // Corresponding data is found and value is bigger than threshold
            if (corresponding_data.length == 1) {
                trade_data = corresponding_data[0];
                trade_value = parseFloat(trade_data.Value);
                trade_weight = parseFloat(trade_data.Weight);

                if (trade_value >= big_trader_threshold) {
                    is_big_trader = true;
                }
            }

            let coordinates = getCoordinates(ISO3);

            if(typeof coordinates === "undefined") {
                coordinates = {
                    latitude : 0,
                    longitude : 0
                };
            }

            new_country = new Country(
                ISO3,
                coordinates.latitude,
                coordinates.longitude,
                is_big_trader,
                trade_value,
                trade_weight,
                geo_feat,
            );

            countries.push(new_country);
        }

        map_group.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr('d', country => { return path(country.geo_feat); })
            .style("fill", country => {
                if (country.is_big_trader) {
                    return d3.color("steelblue");
                } else {
                    return d3.color("lightgrey");
                }
            })
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(country) {
              var x_pos = d3.mouse(this)[0] + 10;
              var y_pos = d3.mouse(this)[1] + 10;
              tooltip.attr("transform", "translate(" + x_pos + "," + y_pos + ")");
              tooltip.select("text").text(country.trade_value);
            });
    });
});


class Country {
    constructor(ISO3, lat, long, is_big_trader, trade_value, trade_weight, geo_feat) {
        this.ISO3 = ISO3;
        this.lat = lat;
        this.long = long;
        this.is_big_trader = is_big_trader;
        this.trade_value = trade_value;
        this.trade_weight = trade_weight;
        this.geo_feat = geo_feat;
    }
}

function compute_big_trader_threshold(data) {
    // Find threshold for values, so that cumulative values cover a given
    // percentage of the data
    const value_coverage = 0.8
    const total_value = data.filter(x => x.PartnerISO == "WLD")[0].Value

    // Remove World
    data = data.filter(x => x.PartnerISO != "WLD")

    // Descending sorted values
    let values = data.map(x => parseInt(x.Value)).sort((a, b) => b - a);

    // Find threshold
    cum_value = 0
    for (let i = 0; i < values.length; i++) {
        cum_value += values[i];

        if (cum_value >= total_value * value_coverage) {
            return values[i];
        }
    }

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
