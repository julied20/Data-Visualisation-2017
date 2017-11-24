
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
