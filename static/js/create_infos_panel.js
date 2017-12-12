let country_card = d3.select('#country_card');
let card_title = d3.select('#country_card_title');
let card_subtitle = d3.select('#country_card_subtitle');
let card_year = d3.select('#country_card_year');
let card_trade_value = d3.select('#country_card_trade_value');
let card_trade_percent = d3.select('#country_card_trade_percent');
let card_trade_rank = d3.select('#country_card_trade_rank');




let ctx_infos = document.getElementById("infos_panel").getContext('2d');
let infos_chart = new Chart(ctx_infos, {
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

function update_infos(country) {
    story = stories[current_story];
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

    if (years.length < 3) {
        console.log("TODO manage countries with few data");
    }

    let zipped = [];

    for(let i = 0; i < years.length; ++i) {
      zipped.push({
          year: years[i],
          trade: trades[i]
      });
    }

    zipped.sort(function(left, right) {
      return left.year === right.year ? 0 : (left.year < right.year ? -1 : 1);
    });

    years = zipped.map(function(d) { return d.year });
    trades = zipped.map(function(d) { return d.trade });

    [background_color, border_color] = get_colors();

    infos_chart.data = {
        labels: years,
        datasets: [{
            label: 'Value of trades ($)',
            data: trades,
            backgroundColor: background_color,
            borderColor: border_color,
            borderWidth: 1,
        }],
    };

    infos_chart.update();
}
