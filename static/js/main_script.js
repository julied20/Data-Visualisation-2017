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
    )
];

let stories_data = [];

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
            refresh_story(this.id);
        })
        .text(story.country_name);
    i++;
});


// Set first list elem as active
nav_ul.select('li')
    .attr('class', 'nav-item active')


let current_year = 2016;

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


// Load countries json
let countries = [];

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

    refresh_story(0);
});


function refresh_story(new_story) {
    current_story = new_story;
    story_data = stories_data[current_story];

    // Set current year as first year appearing in the dataset
    current_year = story_data[0].Year;
    console.log("current year " + current_year);

    let year_data = story_data.filter(x => x.Year == current_year);

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

            if (trade_value >= big_trader_threshold) {
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

    update_timeline()

    update_graph();
}

function update_paths(p) {
    p.attr('d', country => { return path(country.geo_feat); })
    .style("fill", country => {
        if (country.is_big_trader) {
            return stories[current_story].color;
        } else {
            return d3.color("lightgrey");
        }
    })
    .on("mouseover", function(country) {
        tooltip.style("display", null);
        let color;
        if (country.is_big_trader) {
            color = d3.color(stories[current_story].color).darker(0.3);
        } else {
            color = d3.color("darkgrey")
        }

        d3.select(this)
            .transition()
            .duration(100)
            .style("fill", color);
    })
    .on("mouseout", function(country) {
        tooltip.style("display", "none");

        let color;
        if (country.is_big_trader) {
            color = stories[current_story].color;
        } else {
            color = d3.color("lightgrey")
        }

        d3.select(this)
            .transition()
            .duration(100)
            .style("fill", color);
    })
    .on("mousemove", function(country) {
        var x_pos = (d3.mouse(document.body)[0]) - 125;
        var y_pos = (d3.mouse(document.body)[1]) - 125;
        tooltip.attr("transform", "translate(" + x_pos + "," + y_pos + ")");
        tooltip.select("text").text(country.trade_value);
    });
}
