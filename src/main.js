const [Map, FeatureLayer, reactiveUtils, query, centroidOperator] =
  await $arcgis.import([
    "@arcgis/core/Map.js",
    "@arcgis/core/layers/FeatureLayer.js",
    "@arcgis/core/core/reactiveUtils.js",
    "@arcgis/core/rest/query",
    "@arcgis/core/geometry/operators/centroidOperator.js",
  ]);
const viewElement = document.querySelector("arcgis-map");
const popupComponent = document.querySelector("arcgis-popup");
popupComponent.dockOptions = {
  breakpoint: false,
  buttonEnabled: false,
};

// World countries layer.
const countriesLayer = new FeatureLayer({
  url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/1",
  title: "World Countries Generalized",
  renderer: {
    type: "simple",
    symbol: {
      type: "simple-fill",
      color: null,
      outline: {
        color: "grey",
        width: 0.5,
      },
    },
  },
  effect: "drop-shadow(1px, 1px, 1px, white)",
  popupTemplate: {
    title: "{COUNTRY}",
    outFields: ["*"],
    content: [
      {
        // Create custom content
        type: "custom",
        outFields: ["*"],
        creator: async (event) => {
          const div = document.createElement("div");
          let value = "";
          let queryUrl =
            "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/2";
          let country = event.graphic.attributes["COUNTRY"];

          // Query the statistics table for the number of times specific country has
          // placed in the World Cups.
          let firstPlace = await query
            .executeForCount(queryUrl, {
              // autocasts as new Query()
              where: `First='${country}'`,
            })
            .then(
              (count) => {
                return count;
              },
              (error) => {
                console.log(error); // will print error in console if unsupported layers are used
              },
            );

          let secondPlace = await query
            .executeForCount(queryUrl, {
              // autocasts as new Query()
              where: `Second='${country}'`,
            })
            .then(
              (count) => {
                return count;
              },
              (error) => {
                console.log(error); // will print error in console if unsupported layers are used
              },
            );

          let thirdPlace = await query
            .executeForCount(queryUrl, {
              // autocasts as new Query()
              where: `Third='${country}'`,
            })
            .then(
              (count) => {
                return count;
              },
              (error) => {
                console.log(error); // will print error in console if unsupported layers are used
              },
            );

          let fourthPlace = await query
            .executeForCount(queryUrl, {
              // autocasts as new Query()
              where: `Fourth='${country}'`,
            })
            .then(
              (count) => {
                return count;
              },
              (error) => {
                console.log(error); // will print error in console if unsupported layers are used
              },
            );
          div.innerHTML += `Out of all FIFA World Cup tournaments from 1930-2018, ${country} has won: 
            <li>First place <b>${firstPlace}</b> times</li> 
            <li>Second place <b>${secondPlace}</b> times</li>
            <li>Third place <b>${thirdPlace}</b> times</li>
            <li>Fourth place <b>${fourthPlace}</b> times</li>`;
          return div;
        },
      },
      // Add the relationship between the countries layer and the statistics table.
      {
        type: "relationship",
        relationshipId: 1,
        title: "Victories",
        description:
          "Every FIFA World Cup tournament {COUNTRY} has won first place in from 1930-2018 ordered by most recent.",
        displayCount: 2,
        // Order the related features by year starting with most recent
        orderByFields: [
          {
            field: "YEAR",
            order: "desc",
          },
        ],
      },
      // Add the relationship between the countries and stadiums layers
      {
        type: "relationship",
        relationshipId: 0,
        title: "Stadiums in {Country}",
        description:
          "Stadiums played in for the FIFA World Cup from 1930-2018 in {COUNTRY} ordered by largest capacity.",
        displayCount: 2,
        // Order the related features by highest capacity
        orderByFields: [
          {
            field: "Capacity",
            order: "desc",
          },
        ],
      },
    ],
  },
});

// Largest stadium locations for every FIFA World Cup.
const stadiumLayer = new FeatureLayer({
  url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/0",
  title: "FIFA World Cup Largest Stadiums",
  popupTemplate: {
    title: "{StadiumName} ({Year})",
    outFields: ["*"],
    // Add AttachmentsContent to the popup
    content: [
      {
        type: "attachments",
        title: "{StaduimName}",
        description:
          "{StadiumName} was played on in {Year} and resides is {City}, {Country}.",
      },
    ],
    actions: [
      {
        // This text is displayed as a tooltip
        title: "Zoom to Selected Stadium",
        // The ID by which to reference the action in the event handler
        id: "zoom-stadium",
        // Sets the icon used to style the action button
        icon: "zoom-to-object",
      },
      {
        // This text is displayed as a tooltip
        title: "Full Extent",
        // The ID by which to reference the action in the event handler
        id: "full-extent",
        // Sets the icon used to style the action button
        icon: "extent",
      },
    ],
  },
  renderer: {
    type: "simple",
    symbol: {
      type: "picture-marker",
      url: "https://lboyd93.github.io/fifa-world-cup/resources/soccerball.svg",
      width: "32px",
      height: "32px",
    },
  },
});

// Non-spatial table containing FIFA World Cup standings and stats.
const winnersTable = new FeatureLayer({
  url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/2",
  title: "Country Statistics",
  fieldConfigurations: [
    {
      name: "TopScorer",
      alias: "Top Scorers (# of Goals)",
    },
    {
      name: "BestPlayerAward",
      alias: "Best Player Award",
    },
  ],
  popupTemplate: {
    title: "FIFA World Cup {Year} Standings in {Host}",
    outFields: ["*"],
    // Configure the FieldInfos to display in the popup
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "First",
          },
          {
            fieldName: "Second",
          },
          {
            fieldName: "Third",
          },
          {
            fieldName: "Fourth",
          },
          {
            fieldName: "TopScorer",
          },
          {
            fieldName: "BestPlayerAward",
          },
        ],
      },
    ],
  },
});
// Load the non-spatial table and add it to the map's tables.
await winnersTable.load();
viewElement.map = new Map({
  basemap: "satellite",
  layers: [countriesLayer, stadiumLayer],
  tables: [winnersTable],
});
await viewElement.viewOnReady();

const countriesLayerView = await viewElement.whenLayerView(countriesLayer);
// Use reactiveUtils to watch when the layerview is done updating once.
await reactiveUtils.whenOnce(() => !countriesLayerView?.updating);
// Create a query from the layerview.
let countriesQuery = countriesLayerView.createQuery();
countriesQuery.objectIds = [32];
countriesQuery.outFields = countriesLayerView.availableFields;
// Query for Brazil and open it's popup.
const results = await countriesLayerView.queryFeatures(countriesQuery);
const centroid = centroidOperator.execute(results.features[0].geometry);
const brazilFeature = results.features[0];
brazilFeature.popupTemplate = countriesLayer.popupTemplate;
popupComponent.features = [brazilFeature];
popupComponent.location = centroid;
popupComponent.open = true;

const searchComponent = document.querySelector("arcgis-search");
await searchComponent.componentOnReady();
searchComponent.sources = [
  // Add the feature layers as sources to search from.
  {
    layer: countriesLayer,
    placeholder: "Find a country",
    maxResults: 5,
    searchFields: ["Country"],
    displayField: "Country",
    name: "Countries Layer",
    exactMatch: false,
    outFields: ["*"],
  },
  {
    layer: stadiumLayer,
    placeholder: "Find a stadium",
    maxResults: 5,
    searchFields: ["StadiumName"],
    displayField: "StadiumName",
    name: "Stadiums",
  },
];

// This event fires for each click on any action
reactiveUtils.on(
  () => popupComponent,
  "arcgisTriggerAction",
  (event) => {
    // If the zoom-stadium action is clicked, fire the zoomIn() function
    if (event.detail.action.id === "zoom-stadium") {
      if (popupComponent.selectedFeature) {
        // Zooms to the feature at level 17
        viewElement.goTo({
          target: popupComponent.selectedFeature.geometry,
          zoom: 17,
        });
      }
    } // If the full-extent action is clicked, go to the layer's extent
    else if (event.detail.action.id === "full-extent") {
      viewElement.goTo({
        target: stadiumLayer.fullExtent,
      });
    }
  },
);
