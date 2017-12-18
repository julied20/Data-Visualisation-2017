let price_card = d3.select('#price_card');
let price_card_title = d3.select('#price_card_title');
let price_card_subtitle = d3.select('#price_card_subtitle');

let price_card_activated = false;


let ctx_price_card = document.getElementById("price_card_canvas").getContext('2d');
let price_card_chart = new Chart(ctx_price_card, {
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
                },
                scaleLabel: {
                    display: true,
                    labelString: '($ / kg)'
                }
            }]
        },
        maintainAspectRatio: true,
    }
});

function activate_price_card() {
    price_card.attr('class', 'card');
    price_card_activated = true;
}

function desactivate_price_card() {
    price_card.attr('class', 'invisible');
    price_card_activated = false;
}

function update_price_card() {
    // Do not need to update if the country card is disactivated
    if (price_card_activated == false) {
        return;
    }

    const story = stories[current_story];
    price_card_title.text("Evolution of " + story.product_name + " price");
    price_card_subtitle.text("Price of a kg of " + story.product_name);

    let world_data = get_country_data("WLD");

    let years = world_data.years;
    let trades = world_data.trades;
    let weights = world_data.weights;

    let trades_over_weight = trades.map(function(t, i) { return t / weights[i]; });

    [background_color, border_color] = get_colors();

    price_card_chart.data = {
        labels: years,
        datasets: [{
            label: 'Price of a kg ($ / kg)',
            data: trades_over_weight,
            backgroundColor: background_color,
            borderColor: border_color,
            borderWidth: 1,
            pointStyle: 'circle',
        }]
    };

    price_card_chart.update();
}
