let current_story = 0;
let stories = [
    new Story(
        "Belgium",
        "Beer",
        "datasets/belgium_beer_clean.csv",
        "BEL",
        "rgba(255, 206, 86, 1)"
    ),
    new Story(
        "Peru",
        "Quinoa",
        "datasets/peru_quinoa_clean.csv",
        "PER",
        "rgba(147, 159, 92, 1)"
    ),
    new Story(
        "France",
        "Cheese",
        "datasets/france_cheese_clean.csv",
        "FRA",
        "rgba(14, 119, 225, 1)"
    ),
    new Story(
        "France",
        "Wine",
        "datasets/france_wine_clean.csv",
        "FRA",
        "rgba(203, 56, 85, 1)"
    ),
    new Story(
        "Bolivia",
        "Quinoa",
        "datasets/bolivia_quinoa_clean.csv",
        "BOL",
        "rgba(147, 159, 92, 1)"
    ),
];

// Global variables
let stories_data = [];
let current_year;
let countries = [];
let big_traders;

// Create navbar with stories
nav_ul = d3.select('#navbarUL');

let i = 0;
stories.forEach(function(story) {
    nav_ul
    .append('li')
        .attr('class', 'nav-item')
    .append('a')
        .attr('class', 'nav-link')
        .attr('href', '#')
        .attr('id', i)
        .on('click', function() {
            // Remove active for all stories
            nav_ul.selectAll('li').attr('class', 'nav-item');

            // Add active for new story
            this.parentElement.setAttribute('class', 'nav-item active')
            change_story(this.id);
        })
        .text(story.country_name);
    i++;
});


// Set first list elem as active
nav_ul.select('li')
    .attr('class', 'nav-item active')


d3.csv('datasets/countries_codes_and_coordinates.csv', loadIsoCoord);

// Load all csvs
let q = d3.queue();

stories.forEach(function(s) {
    q.defer(d3.csv, s.csv_path);
});

q.awaitAll(function(err, results) {
    if (err) throw err;
    stories_data = results;
});

function get_top_traders(n) {
    let tmp_array = [];

    let story_data = stories_data[current_story];

    let min = story_data[0].Year;
    let max = story_data[story_data.length-1].Year;

    // For each year, take the top n traders and concatenate their ISO in an array
    for (let year = min; year <= max; year++) {
        tmp_array = tmp_array.concat(story_data.filter(x => x.Year == year)
        .sort((a, b) => (parseInt(a.Value) - parseInt(b.Value)))
        .map(x => x.PartnerISO)
        .slice(-n-1,-1))
    }
    return new Set(tmp_array);
}

// Load countries json
d3.json("static/world.geo.json", function(world_json) {
    for (let geo_feat of world_json.features) {

        let ISO3 = geo_feat.properties.iso_a3;

        if(ISO3 == "WLD") {
          continue;
        }

        // For now
        let is_big_trader = false;
        let trade_value = 0.0;
        let trade_weight = 0.0;

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
            geo_feat
        );

        countries.push(new_country);
    }

    change_story(0);

    loading_finished();

});

function change_story(new_story) {
    current_story = new_story;
    story_data = stories_data[current_story];

    big_traders = get_top_traders(10);
    update_scales();

    // Set current year as last year appearing in the dataset
    current_year = story_data[story_data.length - 1].Year
    change_year(current_year);

    update_timeline();
}

let arrow_weight_scale;
let country_color_scale;

function update_scales() {
    let [min, max] = min_max_bigtraders()

    arrow_weight_scale = d3.scalePow()
        .exponent(0.8)
        .domain([min, max])
        .range([2,15]);

    country_color_scale = d3.scalePow()
        .exponent(0.2)
        .domain([0, max])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#F2F2F2"), d3.rgb('#5E5E5E')]);
}

function change_year(new_year) {
    let year_data = story_data.filter(x => x.Year == new_year);

    let big_trader_threshold = compute_big_trader_threshold(year_data);

    for (let country of countries) {
        let is_big_trader = false;
        let trade_value = 0.0;
        let trade_weight = 0.0;

        let corresponding_data = year_data.filter(x => x.PartnerISO == country.ISO3);

        // Corresponding data is found and value is bigger than threshold
        if (corresponding_data.length == 1) {
            trade_data = corresponding_data[0];
            trade_value = parseFloat(trade_data.Value);
            trade_weight = parseFloat(trade_data.Weight);


            if (big_traders.has(country.ISO3)) {
                is_big_trader = true;
            }
        }

        country.is_big_trader = is_big_trader;
        country.trade_value = trade_value;
        country.trade_weight = trade_weight;
    }

    paths = map_group.selectAll("path")
            .data(countries);

    update_paths(paths);
    update_paths(paths.enter().append("path"));

    update_graph();
}

function update_paths(p) {
    p.attr('d', country => { return path(country.geo_feat); })
    .style("fill", country => {
        return country_color_scale(country.trade_value);
    })
    .on("mouseover", function(country) {
        let color;
        color = d3.color(country_color_scale(country.trade_value)).darker(0.3);

        d3.select(this)
            .style("fill", color);

        tooltip_div.attr("class", "")
    })
    .on("mouseout", function(country) {
        let color;
        color = country_color_scale(country.trade_value);

        d3.select(this)
            .transition()
            .duration(100)
            .style("fill", color);

        tooltip_div.attr("class", "invisible")
    })
    .on("mousemove", function(country) {
        var x_pos = (d3.event.pageX) - 60;
        var y_pos = (d3.event.pageY) - 250;

        tooltip_div.style('left', x_pos + 'px')
        tooltip_div.style('top', y_pos + 'px')
    });
}

function loading_finished() {
    d3.select("#loader").attr("class", "invisible");
    d3.select("#content").attr("class", "");
}
