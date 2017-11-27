tooltip_div = d3.select('#tooltip_div')

// Update the bar chart and the title of the tooltip
function update_tooltip(year_index, label, trade_value, percentage) {
    [lower_color, upper_color] = get_colors();

    // Update the bar chart
    chart_tooltip.data = {
        labels: [ label ],
        datasets: [{
            type: 'bar',
            backgroundColor: upper_color,
            data: [ percentage ],
        }, {
            type: 'bar',
            backgroundColor: lower_color,
            data: [ 100- percentage ],
        }],
    };

    // Update the title
    chart_tooltip.titleBlock.options.text = trade_value;

    chart_tooltip.update();
}

let config_tooltip = {
    type: 'bar',
    options: {
        animation: {
            duration: 0
        },
        title: {
            display: true,
            text: "Title",
            position: "bottom"
        },
        legend: {
            display: false,
        },
        tooltips: {
             enabled: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    fontSize: 10
                },
                gridLines : {
                    display : false,
                },
                stacked: true
            }],
            yAxes: [{
                gridLines : {
                    display : false
                },
                stacked: true
            }]
        },
        maintainAspectRatio: false,
    }
};

let ctx_tooltip = document.getElementById("tooltip_canvas").getContext("2d");
let chart_tooltip = new Chart(ctx_tooltip, config_tooltip);
