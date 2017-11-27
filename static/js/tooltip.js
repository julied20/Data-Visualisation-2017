tooltip_div = d3.select('#tooltip_div')

let config = {
  type: 'bar',
  data: {
    labels: ["Switzerland"],
    datasets: [{
      type: 'bar',
      backgroundColor: "red",
      data: [65],
    }, {
      type: 'bar',
      backgroundColor: "blue",
      data: [60]
    }]
  },
  options: {
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
new Chart(ctx_tooltip, config);
