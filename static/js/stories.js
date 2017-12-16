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

const france_europe_boundaries = [[57, -15], [40, 18]];
const france_world_boundaries = [[-25, 150], [68, -125]];

const stories_animations = [
    // France
    new StoryAnimation([
        () => { zoom_to_coords(...france_world_boundaries); },
        () => { zoom_to_coords(...france_europe_boundaries); },
        () => { show_popover('FRA', 'fr_popover_1', 'Europe is the continent were people drink the most wine. French wine is clearly being exported all around Europe. Among its importers, England was the 2nd largest one, but got caught up by the USA in 2015', 'Europe import', 'bottom'); },
        () => {
            hide_popover('fr_popover_1');
            roll_years(300);
        },
        () => { show_popover('FRA', 'fr_popover_2', 'A we can see, the import of French wine in Europe is quite stable since 1998', 'Europe import', 'bottom'); },
        () => {
            zoom_to_coords(...france_world_boundaries);
            change_year(1994);
            hide_popover('fr_popover_2');
        },
        () => {
            roll_years(300, null, 1998);
        },
        () => {
            activate_country_card();
            update_country_card(get_country('JPN'));
            show_popover('JPN', 'fr_popover_3', 'The wine import from Japan said to have peaked in 1998. The fact is that in 1998, too much wine was imported and some was carried over to the next year. That caused a slight decline in the consumption figures.', 'Japan import', 'left');
        },
        () => {
            desactivate_country_card();
            hide_popover('fr_popover_3');

        }
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
        data: { id: 'point_zoom_manual_' + point_id_zoom },
        position: {x: point1[0], y: point1[1] }
    });

    cy.add({
        data: { id: 'point_zoom_manual_' + (point_id_zoom + 1) },
        position: {x: point2[0], y: point2[1] },
    });

    cy.fit(cy.$('#point_zoom_manual_' + point_id_zoom + ', #point_zoom_manual_' + (point_id_zoom+1)));

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

let year_interval;

function roll_years(duration=300, first_year=null, last_year=null) {
    clearInterval(year_interval);
    year_interval = setInterval(next_year_callback, duration);
    let year_i = 0;

    function next_year_callback() {
        if (first_year == null) {
            first_year = parseInt(years[0]);
        }

        if (last_year == null) {
            last_year = parseInt(years[years.length - 1]);
        }

        year_i += 1;
        change_year(first_year + year_i);

        if (first_year + year_i == last_year) {
            clearInterval(year_interval);
        }
    }

}
