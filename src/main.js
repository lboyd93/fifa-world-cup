require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/core/reactiveUtils",
  "esri/widgets/Legend",
  "esri/rest/query",
], (Map, MapView, FeatureLayer, reactiveUtils, Legend, query) => {
  const map = new Map({
    basemap: "satellite",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    popup: {
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
          color: "#FEC310",
          width: 0.5,
        },
      },
    },
    popupTemplate: {
      title: "{COUNTRY}",
      outFields: ["*"],
      fieldInfos: [],
      content: [
        {
          type: "custom",
          outFields: ["*"],
          creator: async (event) => {
            const div = document.createElement("div");
            let value = "";
            let queryUrl =
              "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/2";
            let country = event.graphic.attributes["COUNTRY"];

            let firstPlace = await query.executeForCount(queryUrl, {
                // autocasts as new Query()
                where: `First='${country}'`,
              })
              .then((count) => {
                  return count;
                },
                (error) => {
                  console.log(error); // will print error in console if unsupported layers are used
                }
              );
            
            let secondPlace = await query.executeForCount(queryUrl, {
                // autocasts as new Query()
                where: `Second='${country}'`,
              })
              .then((count) => {
                  return count;
                },
                (error) => {
                  console.log(error); // will print error in console if unsupported layers are used
                }
              );

            let thirdPlace = await query.executeForCount(queryUrl, {
                // autocasts as new Query()
                where: `Third='${country}'`,
              })
              .then((count) => {
                  return count;
                },
                (error) => {
                  console.log(error); // will print error in console if unsupported layers are used
                }
              );

              let fourthPlace = await query.executeForCount(queryUrl, {
                // autocasts as new Query()
                where: `Fourth='${country}'`,
              })
              .then((count) => {
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
        {
          type: "relationship",
          relationshipId: 1,
          title: "Victories",
          description:
            "Every FIFA World Cup tournament {COUNTRY} has won first place in from 1930-2018 ordered by most recent.",
          displayCount: 2,
          orderByFields: [
            {
              field: "YEAR",
              order: "desc",
            },
          ],
        },
        {
          type: "relationship",
          relationshipId: 0,
          title: "Stadiums in {Country}",
          description:
            "Largest stadiums played in for the FIFA World Cup from 1930-2018 in {COUNTRY} ordered by largest attendance.",
          displayCount: 2,
          orderByFields: [
            {
              field: "Capacity",
              order: "desc",
            },
          ],
        }
      ]
    }
  });

  // Largest stadium locations for every FIFA World Cup.
  const stadiumLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/0",
    title: "FIFA World Cup Largest Stadiums",
    popupTemplate: {
      title: "{StadiumName} ({Year})",
      outFields: ["*"],
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
      content: [
        {
          type: "attachments"
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

  view.ui.add(new Legend({ view: view }), "bottom-left");
});
