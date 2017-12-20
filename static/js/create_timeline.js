
const ctx_timeline = document.getElementById("timeline").getContext('2d');
const timeline_chart = new Chart(ctx_timeline, {
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
        // Clickable bars to change year
        onClick: function(e) {
            // Disable controls if in story mode
            if (!story_mode) {
                let element = this.getElementAtEvent(e);
                if (element[0] != undefined) {
                    let index = element[0]._index;
                    change_year(years[index]);
                }
            }
        },
        // Hack to show a pointer cursor on clickable chart elements
        onHover: function(e) {
            // Disable controls if in story mode
            if(!story_mode) {
                let element = this.getElementAtEvent(e);
                if (element[0] != undefined) {
                    d3.select('#timeline')
                        .style('cursor', 'pointer')
                } else {
                    d3.select('#timeline')
                        .style('cursor', 'default')
                }
            }
        },
    }
});

// Update the timeline data after a change_year.
function timeline_year_changed(year) {
    if (timeline_chart.data.datasets.length >= 1) {
        const year_index = year - years[0];

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
}

// Returns the background and border color of current sorty
function get_colors() {
    let background_color = d3.color(stories[current_story].color);
    let border_color = d3.color(stories[current_story].color);

    background_color.opacity = 0.2

    return [background_color, border_color]
}

// Update the timeline with new data, for example after a story change
function update_timeline() {
    const country_data = get_country_data("WLD");
    let years = country_data.years;
    let trades = country_data.trades;
    let weights = country_data.weights;

    [background_color, border_color] = get_colors();

    let background_colors = [];
    // First year selected by default
    background_colors.push(border_color);

    // The other years are not selected
    for (let i = 1; i < years.length; ++i) {
        background_colors.push(background_color);
    }

    // Push constructed data to the chart
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

    // Refresh the chart
    timeline_chart.update();
}
