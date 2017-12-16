let current_story = 0;
let stories_data = [];

class StoryAnimation {
    constructor(steps) {
        this.current_step = 0;
        this.steps = steps;
    }

    reset() {
        this.current_step = 0;
    }

    launch_next() {
        this.steps[this.current_step]();
        this.current_step += 1;

        if (this.current_step >= this.steps.length) {
            end_of_story();
        }
    }
}

class Story {
    constructor(country_name, product_name, csv_path, ISO3, color) {
        this.country_name = country_name;
        this.product_name = product_name;
        this.csv_path = csv_path;
        this.ISO3 = ISO3;
        this.color = color;
    }

    set_data(data) {
        this.data = data;
    }
}

let point_id_zoom = 1;


const stories_animations = [
    new StoryAnimation([
        () => { zoom_to_coords([47, 8], [37, 37]) },
        () => { zoom_to_coords([45, 70], [20, 103]) },
    ]),
    new StoryAnimation([
        () => { zoom_to_location('#topleft_EasternAsia, #bottomright_EasternAsia', 3000, 0) },
        () => { zoom_to_location('#exporter, #USA, #CAN, #DEU', 3000, 0) },
    ]),
    new StoryAnimation([
        () => { zoom_to_location('#topleft_Europe, #bottomright_Europe', 3000, 0) },
        () => { zoom_to_location('#exporter, #USA, #CAN, #DEU', 3000, 0) },
    ]),
];



const stories = [
    new Story(
        "France",
        "Wine",
        "datasets/france_wine_clean.csv",
        "FRA",
        "rgba(203, 56, 85, 1)"
    ),
    new Story(
        "Peru",
        "Quinoa",
        "datasets/peru_quinoa_clean.csv",
        "PER",
        "rgba(147, 159, 92, 1)"
    ),
    new Story(
        "Indonesia",
        "Palm Oil",
        "datasets/indonesia_palm_clean.csv",
        "IDN",
        "rgba(63, 191, 63, 1)"
    ),
];

function zoom_to_location(points, duration, delay) {
    let prev_pos = cy.pan();
    let prev_zoom = cy.zoom();

    cy.fit(cy.$(points));

    let step_x = (cy.pan().x - prev_pos.x) / duration;
    let step_y = (cy.pan().y - prev_pos.y) / duration;
    let step_k = (cy.zoom() - prev_zoom) / duration;

    for (let i = 0; i < duration; i+=10) {
        let t = d3.zoomIdentity
            .translate(prev_pos.x + step_x * i, prev_pos.y + step_y * i)
            .scale(prev_zoom + step_k * i);
        setTimeout(function(){ zoom_step(t); }, delay + i);
    }
}

function zoom_to_coords(coord1, coord2) {

    let point1 = projection([coord1[1], coord1[0]]);
    let point2 = projection([coord2[1], coord2[0]]);

    cy.add({
        data: { id: 'point_id_' + point_id_zoom },
        position: {x: point1[0], y: point1[1] }
    });

    cy.add({
        data: { id: 'point_id_' + (point_id_zoom + 1) },
        position: {x: point2[0], y: point2[1] },
    });

    cy.fit(cy.$('#point_id_' + point_id_zoom + ', #point_id_' + (point_id_zoom+1)));

    let t = d3.zoomIdentity
        .translate(cy.pan().x, cy.pan().y)
        .scale(cy.zoom());

    zoom_step(t);

    point_id_zoom += 2;

}

function zoom_step(transformation) {
    // let transformation = d3.zoomIdentity.translate(-16300, -8666).scale(28);
    // Changes the zoom_level
    zoom_level = transformation.k;
    map_group.attr("transform", transformation);

    // Updates the graph especially for the edges shapes
    update_edges_zoom();

    // Changes the zoom level and the pan parameters to keep the correspondance
    // between the map and the graph
    cy.viewport({
        zoom: zoom_level,
        pan: {
            x: transformation.x,
            y: transformation.y,
        }
    });
}
