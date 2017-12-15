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
    new Story(
        "Switzerland",
        "Chocolate",
        "datasets/switzerland_chocolate_clean.csv",
        "CHE",
        "rgba(112, 74, 44, 1)"
    ),
    new Story(
        "China",
        "Tea",
        "datasets/china_tea_clean.csv",
        "CHN",
        "rgba(63, 191, 63, 1)"
    ),
    new Story(
        "Indonesia",
        "Palm Oil",
        "datasets/indonesia_palm_clean.csv",
        "IDN",
        "rgba(63, 191, 63, 1)"
    ),
    new Story(
        "Brazil",
        "Soy",
        "datasets/brazil_soy_clean.csv",
        "BRA",
        "rgba(63, 191, 63, 1)"
    ),
];

// Global variables
let stories_data = [];
let current_year;
let years = [];
let countries = [];
let big_traders;

const duration = 800;

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

    update_graph();

    update_timeline();

    years = my_chart.config.data.labels;
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

let year_interval;

function roll_years() {
    clearInterval(year_interval);
    year_interval = setInterval(next_year_callback, duration);
    let year_i = 0;

    function next_year_callback() {
        let first_year = parseInt(years[0]);
        let last_year = parseInt(years[years.length - 1]);

        year_i += 1;
        change_year(first_year + year_i);
        year_changed(year_i)
        if (first_year + year_i == last_year) {
            clearInterval(year_interval);
        }
    }

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

    update_edges_click();
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
        let color = country_color_scale(country.trade_value);

        d3.select(this)
            .transition()
            .duration(100)
            .style("fill", color);

        tooltip_div.attr("class", "invisible")
    })
    .on("mousemove", function(country) {
        let x_pos = (d3.event.pageX) - 60;
        let y_pos = (d3.event.pageY) - 250;

        tooltip_div.style('left', x_pos + 'px')
        tooltip_div.style('top', y_pos + 'px')
        update_tooltip(current_year, country.ISO3, country.trade_value, compute_percentage(country))
    })
    .on("click", function(country) {
        update_infos(country.ISO3);
    });
}

function compute_percentage(country) {
    let total_trades_value = story_data.filter(x => x.Year == current_year)
        .filter(x => x.PartnerISO == "WLD")[0].Value;
    return country.trade_value / total_trades_value * 100;;
}

function loading_finished() {
    d3.select("#loader").attr("class", "invisible");
    d3.select("#content").attr("class", "");
//    start_animation();
}

function start_animation() {
    // Display a welcome card
    d3.select("#welcome_card")
        .transition()
        .duration(1000)
        .style("background-color", "red")
        .transition()
        .duration(500)
        .attr("class", "invisible")

    // Select the first story (French Wines) and
    change_story(3);

    let t = d3.zoomIdentity.translate(-16300, -8666).scale(28);
    let t2 = d3.zoomIdentity.translate(0, 0).scale(1);

    /*
    zoom2 = d3.zoom()
        .duration(1000)
        .on("zoom", zoomed_test(t));
*/
/*
    for (let i = 0; i < 50; i++) {
        let t_curr = d3.zoomIdentity.translate(0 - 2*i, 0 - i).scale(1 + i/2);
        svg.transition()
            .duration(1000)
            .call(animated_zoom(t_curr))
    }
    */


//    animated_zoom()

//    zoom_and_pan()

    map_group.transition()
        .duration(1000)
        .attr("transform", t)
        //.tween(update_edges_zoom)
        .transition()
        .duration(1000)
        .attr("transform", t2)






//    zoom_and_pan()
//        .transition()
//        .duration(1000)

//
//    roll_years();


//    roll_years();
}

function zoom_and_pan() {


    let translate_coords = {
        x: -16300,
        y: -8666
    }
    const scale = 28.8;

    zoom_level = scale;

    let origin_country = countries.find(x => find_by_ISO(x, stories[current_story].ISO3));
    let origin_coords = projection([origin_country.long, origin_country.lat]);

    let t = d3.zoomIdentity.translate(translate_coords.x, translate_coords.y).scale(scale);

    console.log(t)

    map_group.transition()
        .duration(5000)
        .attr("transform", t)
        .call(console.log('test'));

    update_edges_zoom();

    let pos = cy.nodes("#exporter").position();

    console.log(pos)
/*
    cy.zoom({
        level : scale,
        position: pos
    })
    */

    cy.animate({
        pan: { x: translate_coords.x, y: translate_coords.y },
        zoom : scale
    },
    { duration: 5000 },
    { easing: "linear"});



/*
    cy.viewport({
        zoom: scale,
        pan: {
            x: translate_coords.x,
            y: translate_coords.y,
        }
    });
    */

}

function animated_zoom(transformation) {


    // let transformation = d3.zoomIdentity.translate(-16300, -8666).scale(28);
    // Changes the zoom_level
    zoom_level = transformation.k;
    console.log(transformation)
    map_group.attr("transform", transformation);

    // Updates the graph especially for the edges shapes
    update_edges_zoom();

    // Changes the zoom level and the pan parameters to keep the correspondance
    // between the map and the graph
    cy.viewport({
        zoom: zoom_level,
        pan: {
            x: transformation.x,
            y: transformation.y,
        }
    });
}

function animated_zoom2(canvas) {
    console.log('test');
    canvas.transition()
      .duration(3000)
      .call(animated_zoom)
}



function transform_zoom_test() {
      return d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(8)
          .translate(-point[0], -point[1]);
    }

    function transition_zoom_test(canvas) {
      map_group.transition()
          .delay(500)
          .duration(3000)
          .call(zoom.transform, zoom_and_pan)
          .on("end", function() { canvas.call(zoom_and_pan); });
    }
