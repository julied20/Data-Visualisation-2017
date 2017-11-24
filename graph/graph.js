

d3.csv('belgium_beers_world.csv', function(data) {
  //console.log(data)
  let years = data.map(function(d) { return d.Year });
  let trades = data.map(function(d) { return d.Trade_Value });

  let zipped = [];

  for(let i=0; i<years.length; ++i) {
      zipped.push({
          array1elem: years[i],
          array2elem: trades[i]
      });
  }

  zipped.sort(function(left, right) {
      let leftArray1elem = left.array1elem,
          rightArray1elem = right.array1elem;

      return leftArray1elem === rightArray1elem ? 0 : (leftArray1elem < rightArray1elem ? -1 : 1);
  });

  years = [];
  trades = [];
  for(i=0; i<zipped.length; ++i) {
      years.push(zipped[i].array1elem);
      trades.push(zipped[i].array2elem);
  }


  let produt_color = 'rgba(255, 206, 86, 0.2)'
  let backgroundColor = []

  for(let i = 0; i < years.length; ++i ) {
    backgroundColor.push(produt_color)
  }

  let ctx = document.getElementById("myChart").getContext('2d');
  let my_chart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: years,
          datasets: [{
              label: 'Value of trades ($)',
              data: trades,
              backgroundColor: backgroundColor,
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
          }]
      },
      options:{
        onClick: function(e){

            let element = this.getElementAtEvent(e);
            // Reset color of every bars
            for(let i=0;i<backgroundColor.length;i++){
              backgroundColor[i] = produt_color;
            }
          if (element[0] != undefined){
            backgroundColor[element[0]._index] = 'rgba(241, 28, 28, 0.8)';
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
        }
    }

  });

})
