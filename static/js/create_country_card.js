// Create the country card panel on the side, to show import graph and current
// year information

const country_card = d3.select('#country_card');
const card_title = d3.select('#country_card_title');
const card_subtitle = d3.select('#country_card_subtitle');
const card_year = d3.select('#country_card_year');
const card_trade_value = d3.select('#country_card_trade_value');
const card_trade_percent = d3.select('#country_card_trade_percent');
const card_trade_rank = d3.select('#country_card_trade_rank');
const card_close_cross = d3.select('#country_card_close');

// Cross to close the card
card_close_cross.on('click', function() {
    // Disable controls if in story mode
    if (!story_mode) {
        desactivate_country_card();
        update_paths(paths);
    }
});

// Holds last selected country
let selected_country;

// true if card is shown
let country_card_activated = false;

// Canvas for import graphs
const ctx_import_graph = document.getElementById("country_card_canvas").getContext('2d');

// Line chart for import graphs
const country_card_chart = new Chart(ctx_import_graph, {
    type: 'line',
    data: {},
    options:{
        scales: {
            yAxes: [{
                ticks: {
                    // Display readable numbers on the y axis
                    callback: function(value, index, values) {
                        return human_readable_number(value);
                    }
                }
            }]
        },
        // Clickable points to change year
        onClick: function(e){
            // Disable controls if in story mode
            if(!story_mode) {
              let element = this.getElementAtEvent(e);
              if (element[0] != undefined) {
                  let index = element[0]._index;
                  change_year(years[index]);
              }
            }
        },
        // Hack to show a pointer cursor on clickable chart elements
        onHover: function(e){
            let element = this.getElementAtEvent(e);
            if (element[0] != undefined) {
                d3.select('#country_card_canvas')
                    .style('cursor', 'pointer')
            } else {
                d3.select('#country_card_canvas')
                    .style('cursor', 'default')
            }
        },
        maintainAspectRatio: true,
    }
});

// Show the country card
function activate_country_card() {
    country_card.attr('class', 'card');
    country_card_activated = true;
}

// Hide the country card
function desactivate_country_card() {
    country_card.attr('class', 'invisible');
    country_card_activated = false;
    if (selected_country != null) {
        selected_country.is_selected = false;
    }
}

// Update the country card, after a change of year or the selection of a country
function update_country_card(country=null) {
    // Do not need to update if the country card is hidden
    if (country_card_activated == false) {
        return;
    }

    // If no country provided, use previously selected country
    if (country == null) {
        country = selected_country;
    }
    // If country provided, use it as selected country
    else {
        // First unselect previously selected country
        if (selected_country != null) {
            selected_country.is_selected = false;
            update_paths(selected_country.svg_path.data([selected_country]));
        }
        // Then select new country
        country.is_selected = true;
        update_paths(country.svg_path.data([country]));
        selected_country = country;
    }

    // Update html fields with the new informations
    const story = stories[current_story];
    card_title.text(country.name);
    card_subtitle.text(story.product_name + " imports - " + story.country_name);
    card_year.text(current_year);
    card_trade_value.text(human_readable_number(country.trade_value));
    card_trade_percent.text(compute_percentage(country).toFixed(2) + '%');
    card_trade_percent.attr('data-original-title', 'The percentage of all ' + story.product_name + ' exports from ' + story.country_name + ' that goes to ' + country.name);

    let rank = get_country_rank(country.ISO3);

    /* Rank is not defined for some countries, for instance if they have
    no trade */
    if(rank == -1) {
        card_trade_rank.text("NA");
    } else {
        card_trade_rank.text("#" + (rank + 1) + " trader");
    }

    let country_data = get_country_data(country.ISO3);

    let years = country_data.years;
    let trades = country_data.trades;

    /* Get years for World import since these imports always exist.
    It allows to always have all years on the x-axis.
    */
    const story_year = get_country_data("WLD").years;
    let graph_data = [];

    for (let i = 0; i < story_year.length; ++i) {
        let trades_per_year = {};
        trades_per_year['year'] = story_year[i];
        const year_index = years.indexOf(story_year[i]);

        // Put zero for trade if years does not contain year <i>
        if (year_index == -1) {
            trades_per_year['trade'] = 0;
            graph_data.push(trades_per_year)
        } else {
            trades_per_year['trade'] = trades[year_index];
            graph_data.push(trades_per_year)
        }

    }

    years = graph_data.map( y => y.year);
    trades = graph_data.map( y => y.trade);

    [background_color, border_color] = get_colors();

    let point_border_colors = []
    let point_background_colors = []
    let point_style = [];
    for (let i = 0; i < trades.length; i++) {
        // No trade and not selected
        if (trades[i] == 0 && years[i] != current_year) {
            point_border_colors.push("#BFBFBF");
            point_background_colors.push("#EEEEEE");
        // No trade and selected
        } else if (trades[i] == 0 && years[i] == current_year){
            point_border_colors.push("#BFBFBF");
            point_background_colors.push("#BFBFBF");
        // Some trade and selected
        } else if (years[i] == current_year) {
            point_border_colors.push(border_color);
            point_background_colors.push(border_color);
        // Some trade and not selected
        } else {
            point_border_colors.push(border_color);
            point_background_colors.push(background_color);
        }
    }

    // Push constructed data into the graph
    country_card_chart.data = {
        labels: years,
        datasets: [{
            label: 'Value of trades ($)',
            data: trades,
            backgroundColor: background_color,
            borderColor: border_color,
            borderWidth: 1,
            pointStyle: 'circle',//point_style,
            pointBorderColor: point_border_colors,
            pointBackgroundColor: point_background_colors
        }]
    };

    // Refresh graph
    country_card_chart.update();
}
