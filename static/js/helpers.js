const ISO = 'BEL'

let iso_geo_coord;

function loadIsoCoord(CSV) {
    iso_geo_coord = CSV;
}

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

class Story {
    constructor(country_name, product_name, csv_path, ISO3, color) {
        this.country_name = country_name;
        this.product_name = product_name;
        this.csv_path = csv_path;
        this.ISO3 = ISO3;
        this.color = color;
    }

    set_data(data) {
        this.data = data;
    }
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
