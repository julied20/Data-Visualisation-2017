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
    constructor(country_name, product_name, csv_path, ISO3, color,
                big_traders_number, more_data_bool, intro_text, img_url) {
        this.country_name = country_name;
        this.product_name = product_name;
        this.csv_path = csv_path;
        this.ISO3 = ISO3;
        this.color = color;
        this.big_traders_number = big_traders_number;
        this.more_data_bool = more_data_bool;
        this.intro_text = intro_text;
        this.img_url = img_url;
    }

    set_data(data) {
        this.data = data;
    }
}

let point_id_zoom = 1;

const france_world_boundaries = [[-25, 150], [68, -125]];
const france_europe_boundaries = [[57, -15], [40, 18]];
const france_asia_boundaries = [[58, 0], [-6, 141]];

const peru_world_boundaries = [[-50, 180], [68, -125]];
const peru_europe_boundaries = [[-22, -90], [58, 31]];
const peru_us_boundaries = [[63, -165], [-20, 0]];

const indonesia_world_boundaries = [[62, -108], [-11, 149]];
const indonesia_europe_boundaries = [[61, -30], [-6, 125]];


const stories_animations = [
    // France
    new StoryAnimation([
        () => {
            zoom_to_coords(...france_world_boundaries);
            show_popover('BRA', 'interface_1', '<p>Each country is colored depending on the value of the imported product. The brighter it is, the lesser it imports</p>')
            setTimeout(() => {
                show_popover_html('#next_step_button', 'interface_2', 'Click on the arrow to continue the story', title='', placement='left');
            }, 1200);
        },
        () => {
            hide_popover('interface_1');
            hide_popover('interface_2');
            zoom_to_coords(...france_europe_boundaries);
        },
        () => {

            show_popover('FRA', 'fr_popover_1', '<p><b>Europe</b> is the continent where people drink the most wine.</p> <p> French wine is clearly being exported all around Europe. Among its importers, England was the 2nd largest one, but got caught up by the USA in 2015.</p>' , 'Europe import', 'bottom');
        },
        () => {
            hide_popover('fr_popover_1');
            roll_years(300, null, null, true, function () {
                show_popover('FRA', 'fr_popover_2', '<p>A we can see, the import of French wine in Europe is quite stable <b>from 1994 to 2016</b>.</p>', 'Europe french wine import', 'bottom');
            });
        },
        () => {
            zoom_to_coords(...france_asia_boundaries);
            change_year(1994);
            show_popover_html('#timeline', 'fr_popover_2_1', 'Back to 1994, looking at Asia imports', '', 'top');
            hide_popover('fr_popover_2');
        },
        () => {
            hide_popover('fr_popover_2_1');
            roll_years(300, null, 1998, true, function () {
                activate_country_card();
                update_country_card(get_country('JPN'));
                show_popover('JPN', 'fr_popover_3', '<p>The wine import from Japan said to have peaked in 1998.</p> <p>The fact is that in 1998, too much wine was imported and some was carried over to the next year. That caused a slight decline in the consumption figures.</p> <a href="https://www.japantimes.co.jp/life/2004/06/06/people/shinya-tasaki/#.Wjeb8bQ-cWp" target="_blank">[Japan Times]</a>', 'Japan french wine import', 'left');
            });
        },
        () => {
            desactivate_country_card();
            hide_popover('fr_popover_3');
            roll_years(300, 1998, 2011, true, function () {
                activate_country_card();
                update_country_card(get_country('CHN'));
                show_popover('CHN', 'fr_popover_4', '<p>A number of factors have contributed to the increase in wine consumption and hence wine imports in recent years. The average wine consumer in China tends to be college educated, and in 2011, <b>nearly six million people graduated from universities and colleges, up from just one million in 2001.</b></p> <p>The average wine consumer also comprises a relatively wealthy part of a growing middle and upper income class. Education and income growth coupled with an overall change in consumer behaviour, growing health awareness and an increasing demand for a modern lifestyle suggest a persistent change in Chinese wine demand over the last decade.</p> <a href="http://onlinelibrary.wiley.com/doi/10.1111/1467-8489.12029/full" target="_blank">[The evolution of foreign wine demand in China]</a>', 'China wine import', 'left');
            });
        },
        () => {
            update_country_card(get_country('HKG'));
            hide_popover('fr_popover_4');
            show_popover('HKG', 'fr_popover_5', '<p>Hong Kong has a significant pool of experienced fine wine merchants with good wine knowledge and international wine trade experience. Amid the growing demand for wine in Asia, the Hong Kong government removed all duty-related customs and administrative controls for wine in February 2008 to facilitate the development of Hong Kong as a wine trading and distribution centre for the region, particularly the Chinese mainland.  <a href="http://hong-kong-economy-research.hktdc.com/business-news/article/Hong-Kong-Industry-Profiles/Wine-Industry-in-Hong-Kong/hkip/en/1/1X000000/1X07WNW7.htm" target="_blank">[Hong Kong Economy Research]</a></p>', 'Hong Kong wine import', 'left');
        },
        () => {
            desactivate_country_card();
            hide_popover('fr_popover_5');
            zoom_to_coords(...france_world_boundaries);
            show_popover('USA', 'fr_popover_6', '<p>Throughout all these years, USA is among the biggest french wine importers.</p>', 'USA wine import', 'bottom');
            roll_years(300, 2011, null);
        },
        () => {
            hide_popover('fr_popover_6');
            activate_price_card();
            update_price_card();
            setTimeout(() => {
                show_popover_html('#next_story_button', 'fr_popover_6', 'Go see the next story about Peruvian Quinoa!', title='', placement='left');
            }, 800);
        }
    ]),
    new StoryAnimation([
        () => { zoom_to_coords(...peru_world_boundaries); },
        () => {
            zoom_to_coords(...peru_us_boundaries);
            activate_country_card();
            update_country_card(get_country('USA'));
            show_popover('USA', 'per_popover_1', '<p> In <b>2012</b>, was the biggest importer of Peruvian Quinoa, with an import share of alomst 70% </p>', 'USA quinoa import', 'top');
        },
        () => {
            desactivate_country_card()
            hide_popover('per_popover_1');
            zoom_to_coords(...peru_europe_boundaries);
            roll_years(500, null, 2014, true, function() {
                activate_country_card()
                update_country_card(get_country('NLD'));
                show_popover('NLD', 'per_popover_2', '<p> By 2014, the Quinoa became popular all over the wolrd and it did not miss Europe.</p> <p> Among the top European importers, <p>The Netherlands come in third position with a total share import of <b>6.50%<b>', 'Netherlands quinoa import', 'right');
            });
         },
         () => {
             desactivate_country_card();
             hide_popover('per_popover_2');
             zoom_to_coords(...peru_world_boundaries);
             roll_years(500, 2014, null);
         },
         () => {
             activate_price_card();
             update_price_card();
             show_popover_html('#price_card_canvas', 'per_popover_3',
                        '<p>The data shows that as prices rose <b>between 2004 and 2013</b>, both producers and consumers in the region benefited financially from the trade.</p> <p> Quinoa farmers, who are among the <b>poorest people in Peru</b>, saw a 46% increase in their welfareover this period, measured by the value of all goods and services consumed by the household.</p> <p> Price rises didn’t negatively affect local consumers either; they benefited thanks to the boost to the economy from higher prices.</p> <a href="https://www.theguardian.com/sustainable-business/2016/jul/17/quinoa-threat-food-security-improving-peruvian-farmers-lives-superfood" target="_blank">[The Guardian]</a>', '', 'right');

             setTimeout(() => {
                 show_popover_html('#next_story_button', 'per_popover_4', 'Go see the next story about Indonesian palm oil!', title='', placement='left');
             }, 800);
         },
    ]),
    new StoryAnimation([
        () => { zoom_to_coords(...indonesia_world_boundaries); },
        () => {
            zoom_to_coords(...indonesia_europe_boundaries);
            roll_years(300, null, 2008, true, function() {
                show_popover('FRA', 'indo_popover_1', '<p>Europe is a core consumer goods manufacturing and retail market for certified sustainable palm oil (CSPO). USDA data for the EU-27 countries shows imports of 6.7 million metric tonnes and consumption of 6.5 million metric tonnes in 2015, making it the second largest market for imports after India, and the fourth largest for domestic consumption after India, Indonesia, and China. </p> <a href="https://www.sustainablepalmoil.org/europe/" target="_blank">[Sustainable Palm Oil]</a>', 'Europe palm oil import', 'left');
                show_popover('IND', 'indo_popover_2', '<p>India is the biggest pal oil importer</p>', 'India palm oil import', 'left');
            });
        },
        () => {
            hide_popover('indo_popover_1');
            hide_popover('indo_popover_2');
            activate_country_card();
            update_country_card(get_country('NLD'));
            show_popover('NLD', 'indo_popover_3', '<p>Indonesia is the world’s biggest palm oil exporter, a lot of that palm oil reaches Europe through the Port of Rotterdam.</p> <p> The Netherlands is <b>the first palm oil importer from 1989 to 1999</b>.</p>', 'Dutch palm oil import', 'right');

        },
        () => {
            hide_popover('indo_popover_3');
            update_country_card(get_country('ITA'));
            show_popover('ITA', 'indo_popover_4', '<p> Mozzarella, ciabatta, Parma ham, etc. When considering Italy’s culinary landscape, palm oil is unlikely to feature high on the list – if at all. Yet the Mediterranean country is <b>the EU’s second largest importer of the oil</b>, which some estimate is found in 90% of biscuits and baked goods in Italian supermarkets.</p>  <a href="https://www.theguardian.com/sustainable-business/2015/dec/09/italy-italian-food-palm-oil-supermarkets-boycott-deforestation-forests-health-environment-china-alliances" target="_blank">[The Guardian]</a>', 'Italian palm oil import', 'right');
        },
        () => {
            hide_popover('indo_popover_4');
            update_country_card(get_country('IND'));
            show_popover('IND', 'indo_popover_5', '<p>India’s imports are traditionally <b>dominated by crude oils</b> which are then refined for the domestic market. But moves by Indonesia to put higher taxes on exports of crude palm oil than refined products - an effort to promote domestic refining industries - made imports of refined products cheaper for India.</p> <a href="https://www.reuters.com/article/india-palmoil-imports/indias-refined-palm-oil-imports-to-fall-as-duty-change-makes-crude-palm-cheaper-idINKCN1AY0LA" target="_blank">[Reuters]</a>', 'Indian palm oil import', 'left');
        },
        () => {
            hide_popover('indo_popover_5');
            desactivate_country_card();
            zoom_to_coords(...indonesia_world_boundaries);
            roll_years(300, 2008, null);
        },
        () => {
                activate_price_card();
                update_price_card();
                show_popover('MAR', 'indo_popover_6', '<p><b>Palm oil plantations "threaten Indonesia\'s orangutans"</b> Orangutans are believed to be increasingly under threat from palm oil plantations in Indonesia. A recent survey found that between 2008 and 2009, more than 750 orangutans were killed by Indonesian villagers working near or on palm oil plantations.</p> <a href="http://www.bbc.com/news/av/science-environment-16336645/palm-oil-plantations-threaten-indonesia-s-orangutans" target="_blank">[BBC News]</a>', 'Global palm oil import', 'bottom');
                setTimeout(() => {
                    show_popover_html('#explore_data_button', 'indo_popover_7', 'Go explore the data!', title='', placement='left');
                }, 800);
        },
    ]),
];



const stories = [
    new Story(
        "France",
        "Wine",
        "datasets/france_wine_clean.csv",
        "FRA",
        "rgba(203, 56, 85, 1)",
        10,
        false,
        "<p> France has historically produced some of the finest vintages around, and its regions have lent their names to some of the world's most famous grapes. </p> <p> Although France is only the third wine exporter, behind Spain and Italy, it goes first place in terms of market values. Among their importers, Europe is leading the market with England, Germany and Belgium being respectively the second, third and fifth importer. The biggest importer of french wine is the USA, with a percentage of 16.92% in 2016. French wine consumption has been growing in Asia for the past few years. In 1998, Japan got a high peak in trade value, buying 531.21 M. Can it be the influence of the ‘French Paradox’? </p> <p> China french wine imports exploded in 2011, making it the fourth importer of french wines in 2016. </p> <p> Hong-Kong and Singapore have a percentage of import of 8.96% making them respectively the sixth and eleventh importers of french wines.</p>",
        "static/img/wine.jpeg"
    ),
    new Story(
        "Peru",
        "Quinoa",
        "datasets/peru_quinoa_clean.csv",
        "PER",
        "rgba(147, 159, 92, 1)",
        10,
        false,
        '<p> Quinoa has not stopped it from taking over salads in kitchens, cafés and supermarkets.</p> <p> The grain used to be the preserve of Andean peasants, but is now hailed for its high protein content by opinion-formers from Oprah Winfrey to the United Nations. Some even celebrated 2013 as the International Year of Quinoa.</p> <p>Before Western consumers developed a taste for quinoa, it was mostly produced by poor farmers in the Andes—in the harsh mountain conditions, where not much else would grow.</p> <p>Bolivia was the main exporter; in Peru producers were largely producing it to eat themselves, consuming around three quarters of what they produced in 2004.</p> <p> But as the rich world discovered the grain, demand outstripped supply. At the peak of the boom, quinoa was going for $6 or $7 a kilogram, more than triple the pre-fad rate. </p> <a href="https://www.economist.com/blogs/economist-explains/2016/05/economist-explains-17" target="_blank">[The Economist]</a>',
        "static/img/quinoa.jpeg"
    ),
    new Story(
        "Indonesia",
        "Palm Oil",
        "datasets/indonesia_palm_clean.csv",
        "IDN",
        "rgba(63, 191, 63, 1)",
        8,
        false,
        '<p> Palm oil is one of the world\'s most produced and consumed oils. This cheap, production-efficient and highly stable oil is used in a wide variety of food, cosmetic and hygiene products, and can be used as source for bio-fuel or biodiesel. Most palm oil is produced in Asia, Africa and South America because the trees require warm temperatures, sunshine and plenty of rain in order to maximize production. </p> <p>You can find it nearly everywhere, from pizza dough to detergents to ice cream, and even in biodiesel and instant noodles. In fact, 50 percent of packaged food items in American supermarkets contain it. </p> <p> But the steadily increasing demand for palm oil, not just in the United States but also around the world, threatens the future of wild orangutans. In Borneo, where the vast majority of orangutans live, their population has declined by 80 percent over the last 75 years </p> <a href="https://www.indonesia-investments.com/business/commodities/palm-oil/item166?" target="_blank">[Indonesia Investments]</a> <a href="https://www.nytimes.com/2017/11/09/learning/lesson-plans/endangered-orangutans-and-the-palm-oil-industry-an-environmental-science-case-study.html" target="_blank">[NY Times]</a>',
        "static/img/palm.jpeg"
    ),
    new Story(
        "Bolivia",
        "Quinoa",
        "datasets/bolivia_quinoa_clean.csv",
        "BOL",
        "rgba(147, 159, 92, 1)",
        10, true, "", ""
        ),
    new Story(
        "Belgium",
        "Beer",
        "datasets/belgium_beer_clean.csv",
        "BEL",
        "rgba(255, 206, 86, 1)",
        10, true, "", ""
    ),
    new Story(
        "France",
        "Cheese",
        "datasets/france_cheese_clean.csv",
        "FRA",
        "rgba(14, 119, 225, 1)",
        10, true, "", ""
    ),
    new Story(
        "Switzerland",
        "Chocolate",
        "datasets/switzerland_chocolate_clean.csv",
        "CHE",
        "rgba(112, 74, 44, 1)",
        7, true, "", ""
    ),
    new Story(
        "China",
        "Tea",
        "datasets/china_tea_clean.csv",
        "CHN",
        "rgba(63, 191, 63, 1)",
        7, true, "", ""
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

function roll_years(duration=300, first_year=null, last_year=null, hide_control_buttons=true, last_year_callback=null) {
    // Hide control buttons if asked
    if (hide_control_buttons) {
        d3.select('#control_buttons_div').attr('class', 'invisible');
    }

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

            // Run callback if provided
            if (last_year_callback != null) {
                last_year_callback();
            }

            // Show control buttons if they were hidden
            if (hide_control_buttons) {
                d3.select('#control_buttons_div').attr('class', '');
            }
        }
    }

}
