let ctx_infos = document.getElementById("infos_panel").getContext('2d');
let infos_chart = new Chart(ctx_infos, {
    type: 'line',
    data: {},
    options:{
        /*
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: '($)'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Year'
            }
          }]
        },
        legend: {
          onClick: null
        },
        */
        maintainAspectRatio: false,
    }
});

function update_infos(country) {
    let years = get_country_data(country).years;
    let trades = get_country_data(country).trades;

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

//    let background_colors = [];

//    for(let i = 0; i < years.length - 1; ++i) {
//        background_colors.push(background_color);
//    }

    // Last year is selected
//    background_colors.push(border_color);

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


function get_country_data(country) {

    let country_data = stories_data[current_story]
        .filter(x => x.PartnerISO == country.ISO3);

    let data = {
        years: country_data.map(function(d) { return d.Year }),
        trades: country_data.map(function(d) { return d.Value }),
    };

    return data
}
