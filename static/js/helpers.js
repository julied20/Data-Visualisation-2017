let story_mode = true;

let iso_geo_coord;

function loadIsoCoord(CSV) {
    iso_geo_coord = CSV;
}

class Country {
    constructor(ISO3, name, lat, long, is_big_trader, trade_value, trade_weight, geo_feat) {
        this.ISO3 = ISO3;
        this.name = name;
        this.lat = lat;
        this.long = long;
        this.is_big_trader = is_big_trader;
        this.trade_value = trade_value;
        this.trade_weight = trade_weight;
        this.geo_feat = geo_feat;
        this.svg_path = null;
    }
}

function show_popover_html(html_selector, popover_id, content, title='', placement='top', center_text=true) {
    const html_elem = d3.select(html_selector);

    html_elem
        .attr('id', popover_id)
        .classed('text-center', true)
        .attr('data-toggle', 'popover')
        .attr('data-container', 'body')
        .attr('title', title)
        .attr('data-placement', placement)
        .attr('data-content', content);

    $('#' + popover_id).popover('show').popover('disable');
}


function show_popover(ISO, popover_id, content, title='', placement='top') {
    const country = countries.find(x => find_by_ISO(x, ISO));
    const coords = getCoordinates(ISO);
    const point = projection([coords.longitude, coords.latitude]);

    map_group.append('circle')
        .attr('r', '5')
        .attr('opacity', 0)
        .attr('transform', 'translate(' + point[0] + ',' + point[1] +')')
        .attr('id', popover_id)
        .attr('data-toggle', 'popover')
        .attr('data-container', 'body')
        .attr('title', title)
        .attr('data-placement', placement)
        .attr('data-content', content);

    $('#' + popover_id).popover('show').popover('disable');
}

function hide_popover(popover_id) {
    $('#'+popover_id).popover('hide')
}

function get_country_name(ISO) {
    const country = iso_geo_coord.filter(x => x.ISO3 == ISO)[0];

    if(typeof country !== "undefined") {
        return country.Country;
    }
}

function getCoordinates(ISO) {
    const country = iso_geo_coord.filter(x => x.ISO3 == ISO)[0];

    if(typeof country !== "undefined") {
        return {
            latitude: parseFloat(country.Latitude),
            longitude: parseFloat(country.Longitude),
        };
    }
}

function get_country_rank(countryISO3) {
    let year_data = story_data.filter(x => x.Year == current_year);

    // Remove World
    year_data = year_data.filter(x => x.PartnerISO != "WLD")

    // Descending sorted values
    let sorted_traders = year_data.sort((a, b) => parseInt(b.Value) - parseInt(a.Value))
                                  .map(x => x.PartnerISO);

    return sorted_traders.indexOf(countryISO3)
}

function get_top_traders(n) {
    let tmp_array = [];

    const story_data = stories_data[current_story];

    const min = story_data[0].Year;
    const max = story_data[story_data.length-1].Year;

    // For each year, take the top n traders and concatenate their ISO in an array
    for (let year = min; year <= max; year++) {
        tmp_array = tmp_array.concat(story_data.filter(x => x.Year == year)
        .sort((a, b) => (parseInt(a.Value) - parseInt(b.Value)))
        .map(x => x.PartnerISO)
        .slice(-n-1,-1))
    }
    return new Set(tmp_array);
}

// Retrieves the trades values for all available years for a given country ISO
function get_country_data(countryISO3) {

    let country_data = stories_data[current_story]
        .filter(x => x.PartnerISO == countryISO3);

    let data = {
        years: country_data.map(function(d) { return d.Year }),
        trades: country_data.map(function(d) { return d.Value }),
    };

    return data
}

let arrow_weight_scale;
let country_color_scale;

function update_scales() {
    let [min, max] = min_max_bigtraders()

    arrow_weight_scale = d3.scalePow()
        .exponent(0.8)
        .domain([min, max])
        .range([2, 25]);

    country_color_scale = d3.scalePow()
        .exponent(0.2)
        .domain([0, max])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#F2F2F2"), d3.rgb('#5E5E5E')]);
}

function compute_percentage(country) {
    let total_trades_value = story_data.filter(x => x.Year == current_year)
        .filter(x => x.PartnerISO == "WLD")[0].Value;
    return country.trade_value / total_trades_value * 100;;
}

// Simply convert big numbers to a human readable format
function human_readable_number(number) {
    if (number >= 1000000000) {
        return  Math.round(number/10000000) / 100 + " B";
    } else if (number >= 1000000) {
        return  Math.round(number/10000) / 100 + " M";
    } else if (number >= 1000) {
        return  Math.round(number/10) / 100 + " K";
    } else {
        return number;
    }
}
