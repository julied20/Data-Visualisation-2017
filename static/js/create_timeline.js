
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
        maintainAspectRatio: false,
        onClick: function(e){
            let element = this.getElementAtEvent(e);
            if (element[0] != undefined) {
                change_year(element[0]._model.label);
                year_changed(element[0]._index);
            }
        },
        onHover: function(e){
            let element = this.getElementAtEvent(e);
            if (element[0] != undefined) {
                d3.select('#timeline')
                    .style('cursor', 'pointer')
            } else {
                d3.select('#timeline')
                    .style('cursor', 'default')
            }
        },
    }
});

function year_changed(year_index) {
    [background_color, border_color] = get_colors();

    backgrounds = my_chart.data.datasets[0].backgroundColor;
    for (let i = 0; i < backgrounds.length; i++) {
        if (i == year_index) {
            backgrounds[i] = border_color;
        } else {
            backgrounds[i] = background_color;
        }
    }
    my_chart.update();
}

function get_colors() {
    let background_color = d3.color(stories[current_story].color);
    let border_color = d3.color(stories[current_story].color);

    background_color.opacity = 0.2

    return [background_color, border_color]
}

function update_timeline() {
    let years = get_country_data("WLD").years;
    let trades = get_country_data("WLD").trades;

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

    let background_colors = [];

    for(let i = 0; i < years.length - 1; ++i) {
        background_colors.push(background_color);
    }

    // Last year is selected
    background_colors.push(border_color);

    my_chart.data = {
        labels: years,
        datasets: [{
            label: 'Value of trades ($)',
            data: trades,
            backgroundColor: background_colors,
            borderColor: border_color,
            borderWidth: 1,
            hoverBackgroundColor: border_color,
        }],
    };

    my_chart.update();
}
