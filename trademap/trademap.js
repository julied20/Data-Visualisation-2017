var map = new Datamap(
    {
        element: document.getElementById('map_container'),
        projection: 'mercator',
        fills: {
            defaultFill: "#ABDDA4",
            authorHasTraveledTo: "#fa0fa0"
        },
        data: {
            USA: { fillKey: "authorHasTraveledTo" },
            JPN: { fillKey: "authorHasTraveledTo" }
        }
    }
);

console.log(map)

d3.csv('datasets/belgium_beers_all_clean.csv', createMap);


const BEL_ISO = 'BEL';

function createMap(data) {
    //const first_arc_dest = data[0].PartnerISO;

    map.arc(
    [
        {
              origin: {
                  latitude: 39.861667,
                  longitude: -104.673056
              },
              destination: {
                  latitude: 35.877778,
                  longitude: -78.7875
              }
        }
    ],
    {strokeWidth: 1, arcSharpness: 1.4});
}
