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
      var leftArray1elem = left.array1elem,
          rightArray1elem = right.array1elem;

      return leftArray1elem === rightArray1elem ? 0 : (leftArray1elem < rightArray1elem ? -1 : 1);
  });

  years = [];
  trades = [];
  for(i=0; i<zipped.length; ++i) {
      years.push(zipped[i].array1elem);
      trades.push(zipped[i].array2elem);
  }


  console.log(years);
  console.log(trades);

  let ctx = document.getElementById("myChart").getContext('2d');
  let myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: years,
          datasets: [{
              label: '# of Votes',
              data: trades,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });


})
