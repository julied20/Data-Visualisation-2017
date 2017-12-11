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
        maintainAspectRatio: false,
    }
});

function update_infos(countryISO3) {
    let years = get_country_data(countryISO3).years;
    let trades = get_country_data(countryISO3).trades;

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
