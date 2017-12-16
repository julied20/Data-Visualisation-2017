// Global variables
let current_year;
let years = [];
let countries = [];
let big_traders;

// Create navbar with stories
nav_stories_ul = d3.select('#navbar_stories_UL');
nav_exploration_ul = d3.select('#navbar_exploration_UL');

stories.forEach((story, index) => {
    nav_stories_ul
    .append('li')
        .attr('class', 'nav-item')
    .append('a')
        .attr('class', 'nav-link')
        .attr('href', '#')
        .attr('id', 'story_nav_' + index)
        .on('click', function() {
            story_mode = true;
            const split_id = this.id.split('_')
            change_story(parseInt(split_id[split_id.length - 1]));
        })
        .text(story.country_name);

        nav_exploration_ul
        .append('li')
            .attr('class', 'nav-item')
        .append('a')
            .attr('class', 'nav-link')
            .attr('href', '#')
            .attr('id', 'explore_nav_' + index)
            .on('click', function() {
                story_mode = false;
                const split_id = this.id.split('_')
                change_story(parseInt(split_id[split_id.length - 1]));
            })
            .text(story.country_name);
});


// Set first list elem as active
nav_stories_ul.select('li')
    .attr('class', 'nav-item active')


d3.csv('datasets/countries_codes_and_coordinates.csv', loadIsoCoord);

// Load all csvs
let q = d3.queue();

stories.forEach(s => q.defer(d3.csv, s.csv_path));

q.awaitAll(function(err, results) {
    if (err) throw err;
    stories_data = results;
});


// Load countries json
d3.json("static/world.geo.json", function(world_json) {
    for (let geo_feat of world_json.features) {

        let ISO3 = geo_feat.properties.iso_a3;

        if(ISO3 == "WLD") {
          continue;
        }
        let coordinates = getCoordinates(ISO3);
        if(typeof coordinates === "undefined") {
            coordinates = {
                latitude : 0,
                longitude : 0
            };
        }
        // For now
        const is_big_trader = false;
        const trade_value = 0.0;
        const trade_weight = 0.0;
        new_country = new Country(
            ISO3,
            get_country_name(ISO3),
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

// Attach launch next story step to next_step_button
const next_step_button = d3.select('#next_step_button');
next_step_button.on('click', () => stories_animations[current_story].launch_next());

// Attach launch next story to next_story_button
const next_story_button = d3.select('#next_story_button');
next_story_button.on('click', () => {
    change_story(current_story + 1);
});

// Attach explore the data to explore_data_button
const explore_data_button = d3.select('#explore_data_button');
explore_data_button.on('click', () => {
    story_mode = false;
    change_story(0);
});

function change_story(new_story) {
    // Remove all popovers
    $('.popover').popover('dispose');

    // Desactivate country_card
    desactivate_country_card();

    current_story = new_story;
    story_data = stories_data[current_story];

    big_traders = get_top_traders(10);
    update_scales();

    // Set current year as first year appearing in the dataset
    current_year = story_data[0].Year;
    change_year(current_year);

    update_graph();

    update_timeline();

    years = timeline_chart.config.data.labels;

    // Remove active for all stories in navbar
    nav_stories_ul.selectAll('li').attr('class', 'nav-item');
    nav_exploration_ul.selectAll('li').attr('class', 'nav-item');
    // Add active for corresponding story in navbar
    if(story_mode) {
        d3.select(nav_stories_ul.select('#story_nav_' + current_story).node().parentNode).attr('class', 'nav-item active');
    } else {
        d3.select(nav_exploration_ul.select('#explore_nav_' + current_story).node().parentNode).attr('class', 'nav-item active');
    }

    // Show intro modal
    if(story_mode) {
        update_intro_modal();
        $('#intro_modal').modal('toggle');
    } else {
        d3.selectAll('.control_button').attr('class', 'control_button invisible');
    }
}

function update_intro_modal() {

    const modal_img = d3.select('#modal_img');
    const modal_txt = d3.select('#modal_txt');

    modal_txt.html(stories[current_story].intro_text);
    modal_img.attr('src' , stories[current_story].img_url);

    const intro_modal_button = d3.select('#intro_modal_button');
    intro_modal_button.on('click', () => start_story_animation());
}

function start_story_animation() {
    let animation = stories_animations[current_story];
    animation.reset();
    animation.launch_next();

    // Make all control buttons invisible except next_step_button
    d3.selectAll('.control_button').attr('class', 'control_button invisible');
    d3.select('#next_step_button').attr('class', 'control_button');
}

function end_of_story() {
    if (current_story < stories.length - 1) {
        // Make all control buttons invisible except next_story_button
        d3.selectAll('.control_button').attr('class', 'control_button invisible');
        d3.select('#next_story_button').attr('class', 'control_button');
    } else {
        // Make all control buttons invisible except explore_data_button
        d3.selectAll('.control_button').attr('class', 'control_button invisible');
        d3.select('#explore_data_button').attr('class', 'control_button');
    }
}

function change_year(new_year) {
    current_year = new_year;
    const year_data = story_data.filter(x => x.Year == new_year);

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
    update_country_card();

    timeline_year_changed(current_year);
}

function update_paths(p) {
    p.attr('d', (country, i) => {
        country.svg_path = d3.select(p._groups[0][i]);
        return path(country.geo_feat);
    })
    .style("fill", country => {
        if (country.is_selected) {
            let color = d3.color(stories[current_story].color);
            color.opacity = 0.5;
            return color;
        } else {
            return country_color_scale(country.trade_value);
        }
    })
    .on("mouseover", function(country) {
        let color;

        if (country.is_selected) {
            color = d3.color(stories[current_story].color).darker(0.3);
            color.opacity = 0.5;
        } else {
            color = d3.color(country_color_scale(country.trade_value)).darker(0.3);
        }

        d3.select(this)
            .style("fill", color)
            .style('cursor', 'pointer');
    })
    .on("mouseout", function(country) {
        let color;

        if (country.is_selected) {
            color = d3.color(stories[current_story].color);
            color.opacity = 0.5;
        } else {
            color = country_color_scale(country.trade_value);
        }

        d3.select(this)
            .transition()
            .duration(100)
            .style("fill", color);
    })
    .on("mousemove", function(country) {
        let x_pos = (d3.event.pageX) - 60;
        let y_pos = (d3.event.pageY) - 250;
    })
    .on("click", function(country) {
        if(!story_mode){
          activate_country_card();
          update_country_card(country);
        }
    });
}

function loading_finished() {
    d3.select("#loader").attr("class", "invisible");
    d3.select("#content").attr("class", "");
    //if (story_mode == true) {
    //  start_animation();
    //}
    // Enable all tooltips
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
}
