let country_card = d3.select('#country_card');
let card_title = d3.select('#country_card_title');
let card_subtitle = d3.select('#country_card_subtitle');
let card_year = d3.select('#country_card_year');
let card_trade_value = d3.select('#country_card_trade_value');
let card_trade_percent = d3.select('#country_card_trade_percent');
let card_trade_rank = d3.select('#country_card_trade_rank');
let card_close_cross = d3.select('#country_card_close');

card_close_cross.on('click', function() {
    country_card.attr('class', 'invisible');
});


let ctx_country_card = document.getElementById("country_card_canvas").getContext('2d');
let country_card_chart = new Chart(ctx_country_card, {
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
        maintainAspectRatio: true,
    }
});

function update_country_card(country) {
    const story = stories[current_story];
    card_title.text(country.name);
    card_subtitle.text(story.product_name + " imports - " + story.country_name);
    card_year.text(current_year);
    card_trade_value.text(human_readable_number(country.trade_value));
    card_trade_percent.text(compute_percentage(country).toFixed(2) + '%');

    let rank = get_country_rank(country.ISO3);

    if(rank == -1) {
        card_trade_rank.text("NA");
    } else {
        card_trade_rank.text("#" + (rank + 1) + " trader");
    }

    let country_data = get_country_data(country.ISO3);

    let years = country_data.years;
    let trades = country_data.trades;

    const story_year = get_country_data("WLD").years;
    let graph_data = [];

    for (let i = 0; i < story_year.length; ++i) {
        let trades_per_year = {};
        trades_per_year['year'] = story_year[i];
        const year_index = years.indexOf(story_year[i]);

        if( year_index == -1  ) {
            trades_per_year['trade'] = 0;
            graph_data.push(trades_per_year)
        } else {
            trades_per_year['trade'] = trades[year_index];
            graph_data.push(trades_per_year)
        }

    }

    years = graph_data.map( y => y.year);
    trades = graph_data.map( y => y.trade);

    if (years.length < 3) {
        console.log("TODO manage countries with few data");
    }


    [background_color, border_color] = get_colors();

    let point_border_colors = []
    let point_background_colors = []
    let point_style = [];
    for (let t of trades) {
        if (t == 0) {
            //point_style.push('crossRot');
            point_border_colors.push("#BFBFBF");
            point_background_colors.push("#EEEEEE");
        } else {
            //point_style.push('circle');
            point_border_colors.push(border_color);
            point_background_colors.push(border_color);

        }
    }

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
            pointBackgoundColor: point_background_colors
        }],
    };

    country_card_chart.update();
}
