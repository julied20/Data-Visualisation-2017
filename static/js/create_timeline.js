
let ctx = document.getElementById("timeline").getContext('2d');
let timeline_chart = new Chart(ctx, {
    type: 'bar',
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
                    labelString: '($)'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
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
                let index = element[0]._index;
                change_year(years[index]);
                timeline_year_changed(element[0]._index);
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

function timeline_year_changed(year_index) {
    [background_color, border_color] = get_colors();

    backgrounds = timeline_chart.data.datasets[0].backgroundColor;
    for (let i = 0; i < backgrounds.length; i++) {
        if (i == year_index) {
            backgrounds[i] = border_color;
        } else {
            backgrounds[i] = background_color;
        }
    }
    timeline_chart.update();
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

    // TODO : Change that: not last year selectetd but first year
    background_colors.push(border_color);

    timeline_chart.data = {
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

    timeline_chart.update();
}
