require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/core/reactiveUtils",
  "esri/widgets/Legend",
  "esri/rest/query",
  "esri/widgets/Search",
], (Map, MapView, FeatureLayer, reactiveUtils, Legend, query, Search) => {
  const alert = document.getElementById("alert");
  const map = new Map({
    basemap: "satellite",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    popup: {
      viewModel: {
        // Removes the default actions on the popup
        includeDefaultActions: false,
      },
      dockEnabled: true,
      dockOptions: {
        breakpoint: false,
        position: "top-right",
      },
    },
  });

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
      fieldInfos: [],
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
                }
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
                }
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
                }
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
                }
              );
            div.innerHTML += `Out of all FIFA World Cup tournaments from 1930-2018, ${country} has won: 
            <li>First place ${firstPlace} times</li> 
            <li>Second place ${secondPlace} times</li>
            <li>Third place ${thirdPlace} times</li>
            <li>Fourth place ${thirdPlace} times</li>`;
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
      // Configure FieldInfos to display in popup
      fieldInfos: [
        {
          fieldName: "City",
        },
        {
          fieldName: "Country",
        },
        {
          fieldName: "Year",
          label: "World Cup year used",
        },
        {
          fieldName: "Capacity",
          format: {
            digitSeparator: true,
          },
        },
      ],
      // Add AttachmentsContent and FieldsContent to the popup
      content: [
        {
          type: "attachments",
        },
        {
          type: "fields",
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
    popupTemplate: {
      title: "FIFA World Cup {Year} Standings in {Host}",
      outFields: ["*"],
      // Configure the FieldInfos to display in the popup
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
          label: "Top scorers and number of goals",
        },
        {
          fieldName: "BestPlayerAward",
          label: "Best player award",
        },
      ],
      content: [
        {
          type: "fields",
        },
      ],
    },
  });
  // Load the non-spatial table and add it to the map's tables.
  winnersTable.load().then(() => {
    map.tables.add(winnersTable);
  });

  map.layers.addMany([countriesLayer, stadiumLayer]);

  view.when(() => {
    view.extent = stadiumLayer.fullExtent;
    view.whenLayerView(countriesLayer).then((countriesLayerView) => {
      // Use reactiveUtils to watch when the layerview is done updating once.
      reactiveUtils
        .whenOnce(() => !countriesLayerView?.updating)
        .then(() => {
          // Create a query from the layerview.
          let query = countriesLayerView.createQuery();
          query.objectIds = [32];
          query.outFields = countriesLayerView.availableFields;
          // Query for the Sonoma-Lake-Napa Unit and open it's popup.
          countriesLayerView.queryFeatures(query).then((results) => {
            view.popup.open({
              features: results.features[0],
              location: results.features[0].geometry.centroid,
              fetchFeatures: true,
            });
          });
        });
    });
  });

  // Defines an action to zoom out from the selected feature
  let zoomToFeatureAction = {
    // This text is displayed as a tooltip
    title: "Zoom to Selected Stadium",
    // The ID by which to reference the action in the event handler
    id: "zoom-to",
    // Sets the icon font used to style the action button
    className: "esri-icon-zoom-in-magnifying-glass",
  };

  // Defines an action to zoom out from the selected feature
  let zoomOutFullExtent = {
    // This text is displayed as a tooltip
    title: "Full Extent",
    // The ID by which to reference the action in the event handler
    id: "full-extent",
    // Sets the icon font used to style the action button
    className: "esri-icon-zoom-out-magnifying-glass",
  };

  // Adds the custom actions to the popup.
  view.popup.actions.push(zoomOutFullExtent);
  view.popup.actions.push(zoomToFeatureAction);

  // The function to execute when the zoom-out action is clicked
  function zoomIn(feature) {
    // Check the feature belongs to the stadium layer
    if (feature.layer.title === "FIFA World Cup Largest Stadiums") {
      // in this case the view zooms to the feature
      view.goTo({
        target: feature.geometry,
        zoom: 17,
      });
    }else{
      alert.open = true;
    }
  }

  // This event fires for each click on any action
  view.popup.on("trigger-action", function (event) {
    // If the zoom-to action is clicked, fire the zoomIn() function
    if (event.action.id === "zoom-to") {
      if (view.popup.selectedFeature) {
        zoomIn(view.popup.selectedFeature);
      }
    } // If the full-extent action is clicked, go to the layer's extent
    else if (event.action.id === "full-extent") {
      view.goTo({
        target: stadiumLayer.fullExtent,
      });
    }
  });

  // Add search widget with the layers as sources to allow for searching of features.
  const search = new Search({
    view: view,
    includeDefaultSources: false,
    activeSourceIndex: 0,
    sources: [
      // Add the feature layers as sources to search from.
      {
        layer: countriesLayer,
        placeholder: "Argentina",
        maxResults: 5,
        searchFields: ["Country"],
        displayField: "Country",
        name: "Countries Layer",
      },
      {
        layer: stadiumLayer,
        placeholder: "Rose Bowl",
        maxResults: 5,
        searchFields: ["StadiumName"],
        displayField: "StadiumName",
        name: "Stadiums",
      },
    ],
  });

  // Add the widgets to the view.
  view.ui.add(new Legend({ view: view }), "bottom-left");
  view.ui.add(search, "bottom-right");
});
