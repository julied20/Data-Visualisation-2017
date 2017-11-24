

let current_year = 2015;
let countries = [];

d3.csv('datasets/countries_codes_and_coordinates.csv', loadIsoCoord);

d3.csv("datasets/belgium_beers_all_clean.csv", function(data) {
    d3.json("world.geo.json", function(world_json) {

      let data_curr_year = data.filter(x => x.Year == current_year);
      let big_trader_threshold = compute_big_trader_threshold(data_curr_year);

      for (let geo_feat of world_json.features) {

        let ISO3 = geo_feat.properties.iso_a3;

        if(ISO3 == "WLD") {
          continue;
        }

        let is_big_trader = false;
        let trade_value = 0.0;
        let trade_weight = 0.0;

        let corresponding_data = data_curr_year.filter(x => x.PartnerISO == ISO3);


        // Corresponding data is found and value is bigger than threshold
        if (corresponding_data.length == 1) {
          trade_data = corresponding_data[0];
          trade_value = parseFloat(trade_data.Value);
          trade_weight = parseFloat(trade_data.Weight);

          if (trade_value >= big_trader_threshold) {
            is_big_trader = true;
          }
        }

        let coordinates = getCoordinates(ISO3);

        if(typeof coordinates === "undefined") {
          coordinates = {
            latitude : 0,
            longitude : 0
          };
        }

        new_country = new Country(
          ISO3,
          coordinates.latitude,
          coordinates.longitude,
          is_big_trader,
          trade_value,
          trade_weight,
          geo_feat
        );

        countries.push(new_country);
      }

      map_group.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr('d', country => { return path(country.geo_feat); })
            .style("fill", country => {
                if (country.is_big_trader) {
                    return d3.color("steelblue");
                } else {
                    return d3.color("lightgrey");
                }
            })
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(country) {
              var x_pos = (d3.mouse(document.body)[0]) + 10;
              var y_pos = (d3.mouse(document.body)[1]) - 115;
              tooltip.attr("transform", "translate(" + x_pos + "," + y_pos + ")");
              tooltip.select("text").text(country.trade_value);
            });

            create_graph()

    });
});
