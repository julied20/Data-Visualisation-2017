// d3.csv('datasets/belgium_beers_world.csv', function(data) {

    //get_world_data(0)

//    let years = data.map(function(d) { return d.Year });
//    let trades = data.map(function(d) { return d.Trade_Value });

let ctx = document.getElementById("timeline").getContext('2d');
let my_chart = new Chart(ctx, {
  type: 'bar',
  data: {},
  options:{
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
    maintainAspectRatio: false
}
});

function update_timeline() {

    let years = get_world_data(current_story).years;
    let trades = get_world_data(current_story).trades;

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

    let product_color = d3.color(stories[current_story].color);
    let border_color = d3.color(stories[current_story].color);

    product_color.opacity = 0.2

    let backgroundColor = [];

    for(let i = 0; i < years.length; ++i) {
    backgroundColor.push(product_color);
    }


    my_chart.data = {
        labels: years,
        datasets: [{
            label: 'Value of trades ($)',
            data: trades,
            backgroundColor: backgroundColor,
            borderColor: border_color,
            borderWidth: 1
        }]
    };
    my_chart.config.options = {
        onClick: function(e){
            let element = this.getElementAtEvent(e);

            // Reset color of every bars
            for(let i = 0; i < backgroundColor.length; i++){
              backgroundColor[i] = product_color;
            }

            if (element[0] != undefined) {
                backgroundColor[element[0]._index] = border_color;
                this.update()
            }
        },
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
        maintainAspectRatio: false
    };

    my_chart.update();
}


function get_world_data(story) {
    let world_data = stories_data[story].filter(x => x.PartnerISO == "WLD");

    let data = {
        years: world_data.map(function(d) { return d.Year }),
        trades: world_data.map(function(d) { return d.Value }),
    };

    return data
}
