# Process Book

Old caveat of the process book

## Project Proposal

### Overview
How have some countries' most typical food exports evolved over time?

Food exports allowed people to have access to the most iconic foods and beverages of every countries in the world. The evolution of those trades is interesting for the general public: who has never tried Swiss chocolate, or Chinese tea?

Some of these products have become more popular over time, like Quinoa, or Belgian beer. Can we see a clear trend? Maybe a map can help us find out.

The scope of the project is to visualise the exportation of some countries' specialties over the years, in an interactive map.

### Related Work and Inspiration:
The map we want to build will look like this : https://resourcetrade.earth/

We will focus on a small amount of (country, product) pairs that are interesting, and will keep 3-5 different time periods that make sense and possibly show an nice evolution in the trades.

## Dataset Preprocessing and first visualisation

We started by creating some jupyter notebooks to explore, pre-process and clean the data we downloaded from the UN Comtrade Database (https://comtrade.un.org/). For the time being, we choose specific products to be presented in our stories, so we downloaded the data by hand but an API is also available. The data that can be extrated from https://comtrade.un.org/ are relatively clean. Most of the pre-processing steps can be summed up by :
- Selecting data of interest
- Keeping only relevant features
- Concatenating the datasets to be able to access multiple years.

Then, we created a first version of our map using Datamaps (http://datamaps.github.io/).

<div align = 'center'>
<img src="images/datamap_version.jpg" width="450" />
</div>

## Second map version

After some discussions with the professor, we decided to abandon the Datamaps library to use Cytoscape on top of a standard topojson map. So we decided to implement each part separately and merge them together later.

### Implementation of Cytoscape

We decided to use Cytoscape to create the graph representing the trades interactions. There were a few issues to solve at this point, first we had to find a way to bound the map to the graph to enable zooming and panning. Then, we had to make a choice about the obvious tradoff between the amount of information and edges to display and the readability of the graph. We decided, for the time being, to fix an arbitrary threshold to discriminate between the main importers of a given product and the rest of the countries.

<div align = 'center'>
<img src="images/cytoscape.jpg" width="450" />
</div>


### Bootstrap and user interface

Simultaneously, we added some user interface elements to enable the navigation between the stories we decided to show. We introduced an information pane on the right of the screen to display a summary of the main data. We also changed the display of the main traders on the map according the decision stated above.

<div align = 'center'>
<img src="images/stories_version1.jpg" width="450" />
</div>

### Timeline creation

The next step was the implementation of a timeline showing the total of exports by year related to a given story. We added some interactions so that the user can select a specific year and the associated data will be displayed on the map. At this point, we decided to get ride off the information pane and to replace it by a tooltip as explained in the next section.


<div align = 'center'>
<img src="images/timeline_1.jpg" width="450" />
</div>


### Tooltips and interactions

For the project prototype step, we added a tooltip which shows the content of the information pane for each country. We focused our attention on improving the esthetic aspect of our visualisation by making the map more colorful, adding a loader, changing the tooltip so that the proportion of each country relatively to the world total exports is displayed.

<div align = 'center'>
<img src="images/current_map_1.jpg" width="450" />
</div>

<div align = 'center'>
<img src="images/current_map_2.jpg" width="450" />
</div>

## Further things to do

- Adding more interactions with the edges for example : change the display of the arcs such that more/less arcs are visible depending on the story / user preferences
- Display the trade weight along with the trade values. The value of some products may have increased but not the amount of exported products.
- Checkboxes to activate multiple countries exporting the same product or multiple iconic products per country.
- Find a way to deal with the skewness of the data to elegantly show the data without loss of rigor.
