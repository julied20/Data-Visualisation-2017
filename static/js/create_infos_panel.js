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
  const story_year = get_country_data("WLD").years;
  let years = get_country_data(countryISO3).years;
  let trades = get_country_data(countryISO3).trades;

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

  infos_chart.data = {
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

  infos_chart.update();
}
